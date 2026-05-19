using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UniserviceAPI.Services;

[ApiController]
[Route("api/[controller]")]
public class SolicitudesController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;

    public SolicitudesController(IConfiguration config, EmailService emailService)
    {
        _config = config;
        _emailService = emailService;
    }

    // 🔹 CREAR SOLICITUD
    [HttpPost]
    public async Task<IActionResult> CrearSolicitud([FromBody] CrearSolicitudDTO dto)
    {
        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            if (dto.id_cliente == dto.id_proveedor)
                return BadRequest(new { error = "No puedes solicitar tu propio servicio." });

            using var checkCmd = new NpgsqlCommand(@"
                SELECT COUNT(*) FROM solicitudes
                WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio AND estado = 'Pendiente'
            ", conn);
            checkCmd.Parameters.AddWithValue("@id_cliente", dto.id_cliente);
            checkCmd.Parameters.AddWithValue("@id_servicio", dto.id_servicio);
            int pendientes = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
            if (pendientes > 0)
                return BadRequest(new { error = "Ya tienes una solicitud pendiente para este servicio." });

            using var insertCmd = new NpgsqlCommand(@"
                INSERT INTO solicitudes (
                    id_cliente, id_proveedor, id_servicio, fue_aceptada,
                    tipo_servicio, tema, descripcion,
                    fecha_deseada, hora_deseada, duracion, modalidad,
                    metodo_pago, presupuesto, pago_anticipado,
                    urgencia, archivo, estado
                ) VALUES (
                    @id_cliente, @id_proveedor, @id_servicio, FALSE,
                    @tipo_servicio, @tema, @descripcion,
                    @fecha_deseada, @hora_deseada, @duracion, @modalidad,
                    @metodo_pago, @presupuesto, @pago_anticipado,
                    @urgencia, @archivo, 'Pendiente'
                )
                RETURNING id_solicitud
            ", conn);

            insertCmd.Parameters.Add(new NpgsqlParameter("@id_cliente", NpgsqlTypes.NpgsqlDbType.Integer) { Value = dto.id_cliente });
            insertCmd.Parameters.Add(new NpgsqlParameter("@id_proveedor", NpgsqlTypes.NpgsqlDbType.Integer) { Value = dto.id_proveedor });
            insertCmd.Parameters.Add(new NpgsqlParameter("@id_servicio", NpgsqlTypes.NpgsqlDbType.Integer) { Value = dto.id_servicio });
            insertCmd.Parameters.Add(new NpgsqlParameter("@tipo_servicio", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.tipo_servicio ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@tema", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.tema ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@descripcion", NpgsqlTypes.NpgsqlDbType.Text) { Value = dto.descripcion ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@fecha_deseada", NpgsqlTypes.NpgsqlDbType.Date) { Value = dto.fecha_deseada.Date });
            insertCmd.Parameters.Add(new NpgsqlParameter("@hora_deseada", NpgsqlTypes.NpgsqlDbType.Time)
            {
                Value = dto.hora_deseada.HasValue ? (object)dto.hora_deseada.Value : DBNull.Value
            });
            insertCmd.Parameters.Add(new NpgsqlParameter("@duracion", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.duracion ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@modalidad", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.modalidad ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@metodo_pago", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.metodo_pago ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@presupuesto", NpgsqlTypes.NpgsqlDbType.Numeric) { Value = dto.presupuesto });
            insertCmd.Parameters.Add(new NpgsqlParameter("@pago_anticipado", NpgsqlTypes.NpgsqlDbType.Boolean) { Value = dto.pago_anticipado });
            insertCmd.Parameters.Add(new NpgsqlParameter("@urgencia", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = dto.urgencia ?? "" });
            insertCmd.Parameters.Add(new NpgsqlParameter("@archivo", NpgsqlTypes.NpgsqlDbType.Varchar)
            {
                Value = string.IsNullOrEmpty(dto.archivo) ? DBNull.Value : (object)dto.archivo
            });

            var idSolicitud = await insertCmd.ExecuteScalarAsync();

            try
            {
                using var connEmail = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
                await connEmail.OpenAsync();

                var cmdEmail = new NpgsqlCommand(@"
                    SELECT u.correo AS email_proveedor, u.nombre AS nombre_proveedor,
                           c.nombre AS nombre_cliente, se.titulo AS titulo_servicio
                    FROM usuarios u
                    INNER JOIN servicios se ON se.id_servicio = @id_servicio
                    INNER JOIN usuarios c ON c.id_usuario = @id_cliente
                    WHERE u.id_usuario = @id_proveedor AND se.id_servicio = @id_servicio
                ", connEmail);
                cmdEmail.Parameters.AddWithValue("@id_proveedor", dto.id_proveedor);
                cmdEmail.Parameters.AddWithValue("@id_cliente", dto.id_cliente);
                cmdEmail.Parameters.AddWithValue("@id_servicio", dto.id_servicio);

                using var readerEmail = await cmdEmail.ExecuteReaderAsync();
                if (await readerEmail.ReadAsync())
                {
                    var emailProveedor = readerEmail["email_proveedor"]?.ToString();
                    var nombreProveedor = readerEmail["nombre_proveedor"]?.ToString();
                    var nombreCliente = readerEmail["nombre_cliente"]?.ToString();
                    var tituloServicio = readerEmail["titulo_servicio"]?.ToString();

                    if (!string.IsNullOrEmpty(emailProveedor))
                    {
                        try
                        {
                            Console.WriteLine("📧 Intentando enviar correo a:", emailProveedor);
                            await _emailService.EnviarNotificacionSolicitud(
                                emailProveedor,
                                nombreProveedor ?? "Proveedor",
                                nombreCliente ?? "Un estudiante",
                                tituloServicio ?? "Tu servicio",
                                dto.tipo_servicio ?? "No especificado",
                                dto.descripcion ?? "",
                                dto.presupuesto.ToString(),
                                dto.urgencia ?? ""
                            );
                        }
                        catch (Exception emailEx)
                        {
                            Console.WriteLine($"❌ Error enviando correo: {emailEx.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR CORREO: {ex.Message}");
            }

            return Ok(new
            {
                message = "Solicitud enviada correctamente",
                id = idSolicitud?.ToString()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // 🔹 SOLICITUDES ENVIADAS
    [HttpGet("enviadas/{id}")]
    public async Task<IActionResult> GetEnviadas(int id)
    {
        var lista = new List<object>();

        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(@"
            SELECT s.id_solicitud, s.estado, s.descripcion,
                   u.nombre AS nombre_proveedor,
                   se.titulo AS titulo_servicio, se.icono
            FROM solicitudes s
            INNER JOIN usuarios u ON s.id_proveedor = u.id_usuario
            INNER JOIN servicios se ON s.id_servicio = se.id_servicio
            WHERE s.id_cliente = @id
            ORDER BY s.id_solicitud DESC
        ", conn);

        cmd.Parameters.AddWithValue("@id", id);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            lista.Add(new
            {
                id_solicitud = reader["id_solicitud"],
                estado = reader["estado"],
                descripcion = reader["descripcion"] == DBNull.Value ? "" : reader["descripcion"].ToString(),
                nombre_proveedor = reader["nombre_proveedor"],
                titulo_servicio = reader["titulo_servicio"],
                icono = reader["icono"]
            });
        }

        return Ok(lista);
    }

    // 🔹 SOLICITUDES RECIBIDAS
    [HttpGet("recibidas/{id}")]
    public async Task<IActionResult> GetRecibidas(int id)
    {
        var lista = new List<object>();

        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(@"
            SELECT s.id_solicitud, s.estado, s.descripcion,
                   u.nombre AS nombre_cliente,
                   se.titulo AS titulo_servicio, se.icono,
                   s.motivo_rechazo, s.contraoferta
            FROM solicitudes s
            INNER JOIN usuarios u ON s.id_cliente = u.id_usuario
            INNER JOIN servicios se ON s.id_servicio = se.id_servicio
            WHERE s.id_proveedor = @id
            ORDER BY s.id_solicitud DESC
        ", conn);

        cmd.Parameters.AddWithValue("@id", id);

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            lista.Add(new
            {
                id_solicitud = reader["id_solicitud"],
                estado = reader["estado"],
                descripcion = reader["descripcion"] == DBNull.Value ? "" : reader["descripcion"].ToString(),
                nombre_cliente = reader["nombre_cliente"],
                titulo_servicio = reader["titulo_servicio"],
                icono = reader["icono"],
                motivo_rechazo = reader["motivo_rechazo"] == DBNull.Value ? "" : reader["motivo_rechazo"].ToString(),
                contraoferta = reader["contraoferta"] == DBNull.Value ? "" : reader["contraoferta"].ToString(),
            });
        }

        return Ok(lista);
    }

    // 🔹 RESPONDER SOLICITUD (ACEPTAR / RECHAZAR)
    [HttpPost("responder")]
    public async Task<IActionResult> Responder([FromBody] ResponderSolicitudDTO dto)
    {
        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        string estado = dto.accion == "aceptar" ? "Aceptada" : "Rechazada";
        // PostgreSQL usa booleanos reales (true/false), no 1/0
        bool fueAceptada = dto.accion == "aceptar";

        var cmd = new NpgsqlCommand(@"
            UPDATE solicitudes
            SET estado = @estado,
                motivo_rechazo = @motivo,
                contraoferta = @contraoferta,
                fue_aceptada = @fue_aceptada
            WHERE id_solicitud = @id
        ", conn);

        cmd.Parameters.AddWithValue("@estado", estado);
        cmd.Parameters.AddWithValue("@motivo", dto.motivo_rechazo ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@contraoferta", dto.contraoferta ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@fue_aceptada", fueAceptada);
        cmd.Parameters.AddWithValue("@id", dto.id_solicitud);

        await cmd.ExecuteNonQueryAsync();

        return Ok(new { message = "Solicitud actualizada" });
    }


    // 🔹 VERIFICAR SI YA EXISTE SOLICITUD
    [HttpGet("verificar")]
    public async Task<IActionResult> Verificar([FromQuery] int id_cliente, [FromQuery] int id_servicio)
    {
        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(@"
        SELECT COUNT(*) FROM solicitudes
        WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio
        AND estado NOT IN ('Rechazada', 'Cancelada')
    ", conn);

        cmd.Parameters.AddWithValue("@id_cliente", id_cliente);
        cmd.Parameters.AddWithValue("@id_servicio", id_servicio);

        var count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
        return Ok(new { existe = count > 0 });
    }

    // 🔹 ELIMINAR SOLICITUD
    [HttpDelete("eliminar")]
    public async Task<IActionResult> Eliminar([FromQuery] int id_cliente, [FromQuery] int id_servicio)
    {
        using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new NpgsqlCommand(@"
        DELETE FROM solicitudes
        WHERE id_cliente = @id_cliente AND id_servicio = @id_servicio
        AND estado NOT IN ('Rechazada', 'Cancelada')
    ", conn);

        cmd.Parameters.AddWithValue("@id_cliente", id_cliente);
        cmd.Parameters.AddWithValue("@id_servicio", id_servicio);

        await cmd.ExecuteNonQueryAsync();
        return Ok(new { message = "Solicitud eliminada" });
    }

}