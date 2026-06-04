using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using UniserviceAPI.DTOs;
using UniserviceAPI.Services;
using UniServiceAPI.Models;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static Dictionary<string, string> codigos = new();
    private static HashSet<string> correosVerificados = new();

    private readonly EmailService _emailService;
    private readonly IConfiguration _config;

    public AuthController(EmailService emailService, IConfiguration config)
    {
        _emailService = emailService;
        _config = config;
    }

    // =========================
    // ENVIAR CÓDIGO
    // =========================
    [AllowAnonymous]
    [HttpPost("send-code")]
    public Task<IActionResult> EnviarCodigo([FromBody] EmailDTO data)
    {
        var codigo = new Random().Next(100000, 999999).ToString();

        codigos[data.correo] = codigo;

        // Expira en 5 min
        _ = Task.Delay(300000).ContinueWith(_ =>
        {
            if (codigos.ContainsKey(data.correo) && codigos[data.correo] == codigo)
                codigos.Remove(data.correo);
        });

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.EnviarCodigoVerificacion(data.correo, codigo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL] Error enviando código: {ex.Message}");
            }
        });

        return Task.FromResult<IActionResult>(Ok(new { ok = true }));
    }

    // =========================
    // VERIFICAR CÓDIGO
    // =========================
    [AllowAnonymous]
    [HttpPost("verify-code")]
    public IActionResult VerificarCodigo([FromBody] VerificarCodigoDTO data)
    {
        if (codigos.ContainsKey(data.correo) && codigos[data.correo] == data.codigo)
        {
            correosVerificados.Add(data.correo);

            return Ok(new { valido = true });
        }

        return BadRequest(new { valido = false });
    }

    // =========================
    // REGISTER (BLOQUEADO SI NO VERIFICÓ)
    // =========================
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        if (string.IsNullOrEmpty(dto.codigo) ||
    !codigos.ContainsKey(dto.correo) ||
    codigos[dto.correo] != dto.codigo)
            return BadRequest(new { error = "Debes verificar el correo primero" });

        codigos.Remove(dto.correo);

        try {
            using (NpgsqlConnection conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection")))
            {
                await conn.OpenAsync();

                var check = new NpgsqlCommand("SELECT COUNT(*) FROM usuarios WHERE correo = @correo", conn);
                check.Parameters.AddWithValue("@correo", dto.correo);

                int existe = Convert.ToInt32(await check.ExecuteScalarAsync());
                if (existe > 0)
                    return BadRequest(new { error = "Correo ya registrado" });

                string hash = BCrypt.Net.BCrypt.HashPassword(dto.password);

                var cmd = new NpgsqlCommand(@"
                    INSERT INTO usuarios (correo, password_hash, nombre, id_rol)
                    VALUES (@correo, @password_hash, @nombre, 2)
                    RETURNING id_usuario", conn);
                cmd.Parameters.AddWithValue("@correo", dto.correo);
                cmd.Parameters.AddWithValue("@password_hash", hash);
                cmd.Parameters.AddWithValue("@nombre", dto.nombre);

                var resultado = await cmd.ExecuteScalarAsync();

                if (resultado == null)
                    return StatusCode(500, new { error = "No se pudo crear el usuario" });

                correosVerificados.Remove(dto.correo);

                return Ok(new { ok = true });
            }
        }
        catch (NpgsqlException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }

    }

    // =========================
    // LOGIN
    // =========================
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        using (NpgsqlConnection conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection")))
        {
            await conn.OpenAsync();

            int id, idRol;
            string nombreUser, correoUser;
            bool estado = true;

            var cmd = new NpgsqlCommand("SELECT id_usuario, id_rol, nombre, correo, password_hash, estado FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            using (var reader = await cmd.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                    return NotFound(new { error = "Usuario no existe o contraseña incorrecta" });

                string hash = reader["password_hash"]?.ToString() ?? "";

                if (string.IsNullOrEmpty(hash) || !BCrypt.Net.BCrypt.Verify(dto.password, hash))
                    return Unauthorized(new { error = "Usuario no existe o contraseña incorrecta" });

                id = (int)reader["id_usuario"];
                idRol = reader["id_rol"] != DBNull.Value ? Convert.ToInt32(reader["id_rol"]) : 2;
                nombreUser = reader["nombre"]?.ToString();
                correoUser = reader["correo"]?.ToString();
                estado = reader["estado"] != DBNull.Value && (bool)reader["estado"];
            }

            if (!estado)
                return Unauthorized(new { error = "Tu cuenta ha sido suspendida. Contacta al administrador." });

            var updateAct = new NpgsqlCommand("UPDATE usuarios SET ultima_actividad = NOW() WHERE id_usuario = @id", conn);
            updateAct.Parameters.AddWithValue("@id", id);
            await updateAct.ExecuteNonQueryAsync();

            // JWT
            var jwtKey = _config["Jwt:Key"] ?? "uniservice_super_secret_key_2026_segura_12345";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var token = new JwtSecurityToken(
                claims: new[] { new Claim("id", id.ToString()), new Claim("id_rol", idRol.ToString()) },
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                user = new
                {
                    id = id,
                    nombre = nombreUser,
                    correo = correoUser,
                    id_rol = idRol
                }
            });
        }
    }

    // =========================
    // LOGOUT (actualizar ultima_actividad)
    // =========================
    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutDTO dto)
    {
        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(
            "UPDATE usuarios SET ultima_actividad = NOW() WHERE id_usuario = @id", conn);
        cmd.Parameters.AddWithValue("@id", dto.id_usuario);
        await cmd.ExecuteNonQueryAsync();

        return Ok(new { ok = true });
    }

    // =========================
    // GOOGLE LOGIN
    // =========================
    [AllowAnonymous]
    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO dto)
    {
        Console.WriteLine($"[GoogleLogin] Received credential: {dto?.credential?.Substring(0, Math.Min(20, dto?.credential?.Length ?? 0))}...");

        if (string.IsNullOrEmpty(dto?.credential))
        {
            Console.WriteLine("[GoogleLogin] ERROR: credential is null or empty");
            return BadRequest(new { error = "Token de Google requerido" });
        }

        try
        {
            var googleClientId = _config["Google:ClientId"];
            Console.WriteLine($"[GoogleLogin] Validating with ClientId: {googleClientId}");

            var payload = await GoogleJsonWebSignature.ValidateAsync(dto.credential, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            });

            Console.WriteLine($"[GoogleLogin] Validated! Email: {payload.Email}, Name: {payload.Name}");

            string correo = payload.Email;
            string nombre = payload.Name ?? correo.Split('@')[0];
            string googleId = payload.Subject;

            using (NpgsqlConnection conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection")))
            {
                await conn.OpenAsync();

                int id, idRol;
                string nombreFinal = nombre;
                bool estado = true;

                var selectCmd = new NpgsqlCommand("SELECT id_usuario, id_rol, nombre, estado FROM usuarios WHERE correo = @correo", conn);
                selectCmd.Parameters.AddWithValue("@correo", correo);
                
                using (var reader = await selectCmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        id = (int)reader["id_usuario"];
                        idRol = reader["id_rol"] != DBNull.Value ? Convert.ToInt32(reader["id_rol"]) : 2;
                        nombreFinal = reader["nombre"]?.ToString() ?? nombre;
                        estado = reader["estado"] != DBNull.Value && (bool)reader["estado"];
                    }
                    else
                    {
                        reader.Close();
                        
                        var insertCmd = new NpgsqlCommand(@"
                            INSERT INTO usuarios (correo, nombre, id_rol)
                            VALUES (@correo, @nombre, 2)
                            RETURNING id_usuario", conn);
                        insertCmd.Parameters.AddWithValue("@correo", correo);
                        insertCmd.Parameters.AddWithValue("@nombre", nombre);

                        var result = await insertCmd.ExecuteScalarAsync();
                        id = Convert.ToInt32(result);
                        idRol = 2;
                    }
                }

                if (!estado)
                    return Unauthorized(new { error = "Tu cuenta ha sido suspendida. Contacta al administrador." });

                var updateActGoogle = new NpgsqlCommand("UPDATE usuarios SET ultima_actividad = NOW() WHERE id_usuario = @id", conn);
                updateActGoogle.Parameters.AddWithValue("@id", id);
                await updateActGoogle.ExecuteNonQueryAsync();

                var jwtKey = _config["Jwt:Key"] ?? "uniservice_super_secret_key_2026_segura_12345";
                var key = Encoding.UTF8.GetBytes(jwtKey);

                var token = new JwtSecurityToken(
                    claims: new[] { new Claim("id", id.ToString()), new Claim("id_rol", idRol.ToString()) },
                    expires: DateTime.UtcNow.AddDays(1),
                    signingCredentials: new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256
                    )
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    user = new
                    {
                        id = id,
                        nombre = nombreFinal,
                        correo = correo,
                        id_rol = idRol
                    }
                });
            }
        }
        catch (InvalidJwtException ex)
        {
            Console.WriteLine($"[GoogleLogin] InvalidJwtException: {ex.Message}");
            return Unauthorized(new { error = "Token de Google inválido" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GoogleLogin] Exception: {ex.GetType().Name} - {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // FORGOT PASSWORD (ENVÍA CÓDIGO DE RECUPERACIÓN)
    // =========================
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] EmailDTO data)
    {
        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", data.correo);
            int existe = Convert.ToInt32(await cmd.ExecuteScalarAsync());

            if (existe == 0)
                return NotFound(new { error = "Correo no registrado" });

            var codigo = new Random().Next(100000, 999999).ToString();
            codigos[data.correo] = codigo;

            _ = Task.Delay(300000).ContinueWith(_ =>
            {
                if (codigos.ContainsKey(data.correo) && codigos[data.correo] == codigo)
                    codigos.Remove(data.correo);
            });

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.EnviarCodigoVerificacion(data.correo, codigo);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL] Error enviando código recuperación: {ex.Message}");
                }
            });

            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // RESET PASSWORD (GUARDA NUEVA CONTRASEÑA)
    // =========================
    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
    {
        if (string.IsNullOrEmpty(dto.codigo) ||
            !codigos.ContainsKey(dto.correo) ||
            codigos[dto.correo] != dto.codigo)
            return BadRequest(new { error = "Código de verificación inválido o expirado" });

        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            string hash = BCrypt.Net.BCrypt.HashPassword(dto.nuevaPassword);

            var cmd = new NpgsqlCommand(
                "UPDATE usuarios SET password_hash = @hash WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@hash", hash);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            int filas = await cmd.ExecuteNonQueryAsync();
            if (filas == 0)
                return NotFound(new { error = "Usuario no encontrado" });

            codigos.Remove(dto.correo);

            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // CAMBIAR CONTRASEÑA (usuario autenticado)
    // =========================
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { error = "Token inválido o expirado" });

            int userId = int.Parse(userIdClaim);

            if (string.IsNullOrEmpty(dto.ContrasenaActual) || string.IsNullOrEmpty(dto.ContrasenaNueva))
                return BadRequest(new { error = "Todos los campos son requeridos" });

            if (dto.ContrasenaNueva.Length < 8)
                return BadRequest(new { error = "La nueva contraseña debe tener al menos 8 caracteres" });

            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("SELECT password_hash FROM usuarios WHERE id_usuario = @id", conn);
            cmd.Parameters.AddWithValue("@id", userId);

            var hash = (string?)await cmd.ExecuteScalarAsync();
            if (string.IsNullOrEmpty(hash))
                return NotFound(new { error = "Usuario no encontrado" });

            if (!BCrypt.Net.BCrypt.Verify(dto.ContrasenaActual, hash))
                return BadRequest(new { error = "La contraseña actual es incorrecta" });

            string nuevoHash = BCrypt.Net.BCrypt.HashPassword(dto.ContrasenaNueva);
            var updateCmd = new NpgsqlCommand(
                "UPDATE usuarios SET password_hash = @hash WHERE id_usuario = @id", conn);
            updateCmd.Parameters.AddWithValue("@hash", nuevoHash);
            updateCmd.Parameters.AddWithValue("@id", userId);

            await updateCmd.ExecuteNonQueryAsync();
            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // CAMBIAR CORREO (usuario autenticado)
    // =========================
    [HttpPost("change-email")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDTO dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { error = "Token inválido o expirado" });

            int userId = int.Parse(userIdClaim);

            if (string.IsNullOrEmpty(dto.NuevoCorreo) || string.IsNullOrEmpty(dto.Password))
                return BadRequest(new { error = "Todos los campos son requeridos" });

            if (!dto.NuevoCorreo.Contains("@"))
                return BadRequest(new { error = "El correo no es válido" });

            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("SELECT password_hash FROM usuarios WHERE id_usuario = @id", conn);
            cmd.Parameters.AddWithValue("@id", userId);

            var hash = (string?)await cmd.ExecuteScalarAsync();
            if (string.IsNullOrEmpty(hash))
                return NotFound(new { error = "Usuario no encontrado" });

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, hash))
                return BadRequest(new { error = "La contraseña es incorrecta" });

            var checkCmd = new NpgsqlCommand(
                "SELECT COUNT(*) FROM usuarios WHERE correo = @correo AND id_usuario != @id", conn);
            checkCmd.Parameters.AddWithValue("@correo", dto.NuevoCorreo);
            checkCmd.Parameters.AddWithValue("@id", userId);

            int existe = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
            if (existe > 0)
                return BadRequest(new { error = "El correo ya está en uso por otra cuenta" });

            var updateCmd = new NpgsqlCommand(
                "UPDATE usuarios SET correo = @correo WHERE id_usuario = @id", conn);
            updateCmd.Parameters.AddWithValue("@correo", dto.NuevoCorreo);
            updateCmd.Parameters.AddWithValue("@id", userId);

            await updateCmd.ExecuteNonQueryAsync();
            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // =========================
    // VERIFICAR CONTRASEÑA MAESTRA DE ADMIN
    // =========================
    private static readonly Lazy<string> _defaultAdminMasterHash = new(() =>
        BCrypt.Net.BCrypt.HashPassword("admin_2026"));

    private static readonly Dictionary<int, (int intentos, DateTime bloqueadoHasta)> _adminAttempts = new();

    [HttpPost("verify-admin-master")]
    public async Task<IActionResult> VerifyAdminMaster([FromBody] VerifyAdminMasterDTO dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            var rolClaim = User.FindFirst("id_rol")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { error = "Token inválido o expirado" });

            if (rolClaim != "1")
                return StatusCode(403, new { error = "No tienes permisos de administrador" });

            int userId = int.Parse(userIdClaim);

            if (_adminAttempts.TryGetValue(userId, out var entry))
            {
                if (entry.bloqueadoHasta > DateTime.UtcNow)
                {
                    var minutosRestantes = (int)Math.Ceiling((entry.bloqueadoHasta - DateTime.UtcNow).TotalMinutes);
                    return StatusCode(429, new { error = $"Demasiados intentos. Intenta de nuevo en {minutosRestantes} minuto(s).", bloqueado = true });
                }

                if (entry.bloqueadoHasta != default)
                    _adminAttempts.Remove(userId);
            }

            var storedHash = _config["Admin:MasterPasswordHash"] ?? _defaultAdminMasterHash.Value;

            if (!BCrypt.Net.BCrypt.Verify(dto.MasterPassword, storedHash))
            {
                var nuevosIntentos = entry.intentos + 1;
                if (nuevosIntentos >= 3)
                {
                    var bloqueoHasta = DateTime.UtcNow.AddMinutes(10);
                    _adminAttempts[userId] = (nuevosIntentos, bloqueoHasta);
                    return BadRequest(new { error = "Demasiados intentos fallidos. Cuenta bloqueada por 10 minutos.", bloqueado = true });
                }

                _adminAttempts[userId] = (nuevosIntentos, default);
                return BadRequest(new { error = $"Contraseña maestra incorrecta. Intento {nuevosIntentos} de 3.", intentos = nuevosIntentos });
            }

            _adminAttempts.Remove(userId);
            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}