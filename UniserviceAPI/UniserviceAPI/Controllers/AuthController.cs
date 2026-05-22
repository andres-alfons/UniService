using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UniserviceAPI.DTOs;
using UniserviceAPI.Services;
using UniServiceAPI.Models;
using Google.Apis.Auth;

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
    [HttpPost("send-code")]
    public async Task<IActionResult> EnviarCodigo([FromBody] EmailDTO data)
    {
        var codigo = new Random().Next(100000, 999999).ToString();

        codigos[data.correo] = codigo;

        // Expira en 5 min
        _ = Task.Delay(300000).ContinueWith(_ =>
        {
            if (codigos.ContainsKey(data.correo) && codigos[data.correo] == codigo)
                codigos.Remove(data.correo);
        });

        await _emailService.EnviarCodigoVerificacion(data.correo, codigo);

        return Ok(new { ok = true });
    }

    // =========================
    // VERIFICAR CÓDIGO
    // =========================
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
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        using (NpgsqlConnection conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection")))
        {
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("SELECT * FROM usuarios WHERE correo = @correo", conn);
            cmd.Parameters.AddWithValue("@correo", dto.correo);

            var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
                return NotFound(new { error = "Usuario no existe" });

            await reader.ReadAsync();

            string hash = reader["password_hash"]?.ToString() ?? "";

            if (string.IsNullOrEmpty(hash) || !BCrypt.Net.BCrypt.Verify(dto.password, hash))
                return Unauthorized(new { error = "Contraseña incorrecta" });

            int id = (int)reader["id_usuario"];
            int idRol = reader["id_rol"] != DBNull.Value ? Convert.ToInt32(reader["id_rol"]) : 2;

            // Actualizar ultima_actividad al hacer login
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
                    nombre = reader["nombre"]?.ToString(),
                    correo = reader["correo"]?.ToString(),
                    id_rol = idRol
                }
            });
        }
    }

    // =========================
    // LOGOUT (actualizar ultima_actividad)
    // =========================
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

                var cmd = new NpgsqlCommand("SELECT * FROM usuarios WHERE correo = @correo", conn);
                cmd.Parameters.AddWithValue("@correo", correo);

                var reader = await cmd.ExecuteReaderAsync();

                int id, idRol;

                if (reader.HasRows)
                {
                    await reader.ReadAsync();
                    id = (int)reader["id_usuario"];
                    idRol = reader["id_rol"] != DBNull.Value ? Convert.ToInt32(reader["id_rol"]) : 2;
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

                // Actualizar ultima_actividad al hacer login con Google
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
                        nombre = nombre,
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

            await _emailService.EnviarCodigoVerificacion(data.correo, codigo);

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
}