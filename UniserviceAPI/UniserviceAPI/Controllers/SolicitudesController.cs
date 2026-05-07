using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new SqlCommand("sp_GestionarSolicitud", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@id_cliente", SqlDbType.Int).Value = dto.id_cliente;
            cmd.Parameters.Add("@id_proveedor", SqlDbType.Int).Value = dto.id_proveedor;
            cmd.Parameters.Add("@id_servicio", SqlDbType.Int).Value = dto.id_servicio;

            cmd.Parameters.Add("@tipo_servicio", SqlDbType.NVarChar).Value = dto.tipo_servicio ?? "";
            cmd.Parameters.Add("@tema", SqlDbType.NVarChar).Value = dto.tema ?? "";
            cmd.Parameters.Add("@descripcion", SqlDbType.NVarChar).Value = dto.descripcion ?? "";

            cmd.Parameters.Add("@fecha_deseada", SqlDbType.Date).Value = dto.fecha_deseada;

            cmd.Parameters.Add("@hora_deseada", SqlDbType.Time).Value =
                dto.hora_deseada.HasValue
                    ? (object)dto.hora_deseada.Value
                    : DBNull.Value;

            cmd.Parameters.Add("@duracion", SqlDbType.NVarChar).Value = dto.duracion ?? "";
            cmd.Parameters.Add("@modalidad", SqlDbType.NVarChar).Value = dto.modalidad ?? "";

            cmd.Parameters.Add("@metodo_pago", SqlDbType.NVarChar).Value = dto.metodo_pago ?? "";

            cmd.Parameters.Add("@presupuesto", SqlDbType.Decimal).Value =
                dto.presupuesto;

            cmd.Parameters.Add("@pago_anticipado", SqlDbType.Decimal).Value =
                dto.pago_anticipado;

            cmd.Parameters.Add("@urgencia", SqlDbType.NVarChar).Value = dto.urgencia ?? "";

            cmd.Parameters.Add("@archivo", SqlDbType.NVarChar).Value =
                dto.archivo ?? (object)DBNull.Value;

            using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                var resultado = reader["Resultado"]?.ToString();
                var idSolicitud = reader["id_solicitud"]?.ToString();

                if (!string.IsNullOrEmpty(resultado) &&
                    resultado.Contains("exitosamente", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        using var connEmail = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                        await connEmail.OpenAsync();

                        var cmdEmail = new SqlCommand(@"
                            SELECT 
                                u.email AS email_proveedor,
                                u.nombre AS nombre_proveedor,
                                c.nombre AS nombre_cliente,
                                se.titulo AS titulo_servicio
                            FROM usuarios u
                            INNER JOIN servicios se 
                                ON se.id_servicio = @id_servicio
                            INNER JOIN usuarios c 
                                ON c.id_usuario = @id_cliente
                            WHERE u.id_usuario = @id_proveedor
                        ", connEmail);

                        cmdEmail.Parameters.Add("@id_proveedor", SqlDbType.Int).Value = dto.id_proveedor;
                        cmdEmail.Parameters.Add("@id_cliente", SqlDbType.Int).Value = dto.id_cliente;
                        cmdEmail.Parameters.Add("@id_servicio", SqlDbType.Int).Value = dto.id_servicio;

                        using var readerEmail = await cmdEmail.ExecuteReaderAsync();

                        if (await readerEmail.ReadAsync())
                        {
                            var emailProveedor = readerEmail["email_proveedor"]?.ToString();
                            var nombreProveedor = readerEmail["nombre_proveedor"]?.ToString();
                            var nombreCliente = readerEmail["nombre_cliente"]?.ToString();
                            var tituloServicio = readerEmail["titulo_servicio"]?.ToString();

                            if (!string.IsNullOrWhiteSpace(emailProveedor))
                            {
                                _ = _emailService.EnviarNotificacionSolicitud(
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
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error enviando correo: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    message = resultado,
                    id = idSolicitud
                });
            }

            return BadRequest(new
            {
                message = "No se pudo crear la solicitud"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                error = ex.Message
            });
        }
    }

    // 🔹 SOLICITUDES ENVIADAS
    [HttpGet("enviadas/{id}")]
    public async Task<IActionResult> GetEnviadas(int id)
    {
        var lista = new List<object>();

        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT 
                s.id_solicitud,
                s.estado,
                s.descripcion,
                u.nombre AS nombre_proveedor,
                se.titulo AS titulo_servicio,
                se.icono
            FROM solicitudes s
            INNER JOIN usuarios u 
                ON s.id_proveedor = u.id_usuario
            INNER JOIN servicios se 
                ON s.id_servicio = se.id_servicio
            WHERE s.id_cliente = @id
            ORDER BY s.id_solicitud DESC
        ", conn);

        cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            lista.Add(new
            {
                id_solicitud = reader["id_solicitud"],
                estado = reader["estado"],
                descripcion = reader["descripcion"] == DBNull.Value
                    ? ""
                    : reader["descripcion"].ToString(),

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

        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT 
                s.id_solicitud,
                s.estado,
                s.descripcion,
                u.nombre AS nombre_cliente,
                se.titulo AS titulo_servicio,
                se.icono,
                s.motivo_rechazo,
                s.contraoferta
            FROM solicitudes s
            INNER JOIN usuarios u 
                ON s.id_cliente = u.id_usuario
            INNER JOIN servicios se 
                ON s.id_servicio = se.id_servicio
            WHERE s.id_proveedor = @id
            ORDER BY s.id_solicitud DESC
        ", conn);

        cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            lista.Add(new
            {
                id_solicitud = reader["id_solicitud"],
                estado = reader["estado"],

                descripcion = reader["descripcion"] == DBNull.Value
                    ? ""
                    : reader["descripcion"].ToString(),

                nombre_cliente = reader["nombre_cliente"],
                titulo_servicio = reader["titulo_servicio"],
                icono = reader["icono"],

                motivo_rechazo = reader["motivo_rechazo"] == DBNull.Value
                    ? ""
                    : reader["motivo_rechazo"].ToString(),

                contraoferta = reader["contraoferta"] == DBNull.Value
                    ? null
                    : reader["contraoferta"]
            });
        }

        return Ok(lista);
    }

    // 🔹 RESPONDER SOLICITUD
    [HttpPost("responder")]
    public async Task<IActionResult> Responder([FromBody] ResponderSolicitudDTO dto)
    {
        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        bool aceptar = dto.accion.Equals(
            "aceptar",
            StringComparison.OrdinalIgnoreCase
        );

        string estado = aceptar ? "Aceptada" : "Rechazada";
        int fueAceptada = aceptar ? 1 : 0;

        var cmd = new SqlCommand(@"
            UPDATE solicitudes
            SET 
                estado = @estado,
                motivo_rechazo = @motivo,
                contraoferta = @contraoferta,
                fue_aceptada = @fue_aceptada
            WHERE id_solicitud = @id
        ", conn);

        cmd.Parameters.Add("@estado", SqlDbType.NVarChar).Value = estado;

        cmd.Parameters.Add("@motivo", SqlDbType.NVarChar).Value =
            dto.motivo_rechazo ?? (object)DBNull.Value;

        cmd.Parameters.Add("@contraoferta", SqlDbType.NVarChar).Value =
            dto.contraoferta ?? (object)DBNull.Value;

        cmd.Parameters.Add("@fue_aceptada", SqlDbType.Int).Value = fueAceptada;
        cmd.Parameters.Add("@id", SqlDbType.Int).Value = dto.id_solicitud;

        await cmd.ExecuteNonQueryAsync();

        return Ok(new
        {
            message = "Solicitud actualizada"
        });
    }

    // 🔹 VERIFICAR SI YA EXISTE SOLICITUD
    [HttpGet("verificar")]
    public async Task<IActionResult> Verificar(
        [FromQuery] int id_cliente,
        [FromQuery] int id_servicio
    )
    {
        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT COUNT(*)
            FROM solicitudes
            WHERE id_cliente = @id_cliente
            AND id_servicio = @id_servicio
            AND estado NOT IN ('Rechazada', 'Cancelada')
        ", conn);

        cmd.Parameters.Add("@id_cliente", SqlDbType.Int).Value = id_cliente;
        cmd.Parameters.Add("@id_servicio", SqlDbType.Int).Value = id_servicio;

        var count = (int)await cmd.ExecuteScalarAsync();

        return Ok(new
        {
            existe = count > 0
        });
    }

    // 🔹 CANCELAR SOLICITUD
    [HttpDelete("eliminar")]
    public async Task<IActionResult> Eliminar(
        [FromQuery] int id_cliente,
        [FromQuery] int id_servicio
    )
    {
        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();

        var cmd = new SqlCommand(@"
            UPDATE solicitudes
            SET estado = 'Cancelada'
            WHERE id_cliente = @id_cliente
            AND id_servicio = @id_servicio
            AND estado NOT IN ('Rechazada', 'Cancelada')
        ", conn);

        cmd.Parameters.Add("@id_cliente", SqlDbType.Int).Value = id_cliente;
        cmd.Parameters.Add("@id_servicio", SqlDbType.Int).Value = id_servicio;

        await cmd.ExecuteNonQueryAsync();

        return Ok(new
        {
            message = "Solicitud cancelada"
        });
    }
}