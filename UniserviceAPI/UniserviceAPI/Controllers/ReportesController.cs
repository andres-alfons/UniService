using Microsoft.AspNetCore.Mvc;
using Npgsql;

[ApiController]
[Route("api/reportes")]
public class ReportesController : ControllerBase
{
    private readonly IConfiguration _config;

    public ReportesController(IConfiguration config)
    {
        _config = config;
    }

    // ── POST /api/reportes ── Usuario crea un reporte
    [HttpPost]
    public async Task<IActionResult> CrearReporte([FromBody] CrearReporteDTO dto)
    {
        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand(@"
                INSERT INTO reportes
                    (id_usuario, id_servicio, id_solicitud, tipo_reporte, titulo, descripcion, evidencia)
                VALUES
                    (@id_usuario, @id_servicio, @id_solicitud, @tipo_reporte, @titulo, @descripcion, @evidencia)
                RETURNING id_reporte, fecha_creacion, estado
            ", conn);

            cmd.Parameters.AddWithValue("@id_usuario", dto.id_usuario);
            cmd.Parameters.AddWithValue("@id_servicio", dto.id_servicio.HasValue ? (object)dto.id_servicio.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("@id_solicitud", dto.id_solicitud.HasValue ? (object)dto.id_solicitud.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("@tipo_reporte", dto.tipo_reporte);
            cmd.Parameters.AddWithValue("@titulo", dto.titulo);
            cmd.Parameters.AddWithValue("@descripcion", dto.descripcion);
            cmd.Parameters.AddWithValue("@evidencia", string.IsNullOrEmpty(dto.evidencia) ? DBNull.Value : (object)dto.evidencia);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return Ok(new
                {
                    ok = true,
                    id_reporte = reader.GetInt32(0),
                    fecha_creacion = reader.GetDateTime(1),
                    estado = reader.GetString(2)
                });
            }

            return StatusCode(500, new { ok = false, error = "No se pudo crear el reporte." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { ok = false, error = ex.Message });
        }
    }

    // ── GET /api/reportes/usuario/{id} ── Usuario ve sus propios reportes
    [HttpGet("usuario/{id_usuario}")]
    public async Task<IActionResult> GetReportesUsuario(int id_usuario)
    {
        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand(@"
                SELECT r.id_reporte, r.tipo_reporte, r.titulo, r.descripcion,
                       r.estado, r.fecha_creacion, r.fecha_resolucion,
                       r.resolucion_notas, r.evidencia,
                       s.titulo_servicio, sol.estado AS estado_solicitud
                FROM reportes r
                LEFT JOIN servicios s ON r.id_servicio = s.id_servicio
                LEFT JOIN solicitudes sol ON r.id_solicitud = sol.id_solicitud
                WHERE r.id_usuario = @id_usuario
                ORDER BY r.fecha_creacion DESC
            ", conn);

            cmd.Parameters.AddWithValue("@id_usuario", id_usuario);

            var lista = new List<object>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new
                {
                    id_reporte = reader.GetInt32(0),
                    tipo_reporte = reader.GetString(1),
                    titulo = reader.GetString(2),
                    descripcion = reader.GetString(3),
                    estado = reader.GetString(4),
                    fecha_creacion = reader.GetDateTime(5),
                    fecha_resolucion = reader.IsDBNull(6) ? (DateTime?)null : reader.GetDateTime(6),
                    resolucion_notas = reader.IsDBNull(7) ? null : reader.GetString(7),
                    evidencia = reader.IsDBNull(8) ? null : reader.GetString(8),
                    titulo_servicio = reader.IsDBNull(9) ? null : reader.GetString(9),
                    estado_solicitud = reader.IsDBNull(10) ? null : reader.GetString(10),
                });
            }

            return Ok(lista);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { ok = false, error = ex.Message });
        }
    }

    // ── GET /api/reportes/admin ── Admin ve TODOS los reportes
    [HttpGet("admin")]
    public async Task<IActionResult> GetTodosReportes([FromQuery] string? estado = null)
    {
        try
        {
            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            var where = string.IsNullOrEmpty(estado) ? "" : "WHERE r.estado = @estado";

            using var cmd = new NpgsqlCommand($@"
               SELECT r.id_reporte, r.tipo_reporte, r.titulo, r.descripcion,
                   r.estado, r.fecha_creacion, r.fecha_resolucion,
                   r.resolucion_notas, r.evidencia,
                   u.nombre AS nombre_usuario, u.correo AS correo_usuario,
                   s.titulo AS titulo_servicio
               FROM reportes r
               JOIN usuarios u ON r.id_usuario = u.id_usuario
               LEFT JOIN servicios s ON r.id_servicio = s.id_servicio
                {where}
                ORDER BY r.fecha_creacion DESC
            ", conn);

            if (!string.IsNullOrEmpty(estado))
                cmd.Parameters.AddWithValue("@estado", estado);

            var lista = new List<object>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                lista.Add(new
                {
                    id_reporte = reader.GetInt32(0),
                    tipo_reporte = reader.GetString(1),
                    titulo = reader.GetString(2),
                    descripcion = reader.GetString(3),
                    estado = reader.GetString(4),
                    fecha_creacion = reader.GetDateTime(5),
                    fecha_resolucion = reader.IsDBNull(6) ? (DateTime?)null : reader.GetDateTime(6),
                    resolucion_notas = reader.IsDBNull(7) ? null : reader.GetString(7),
                    evidencia = reader.IsDBNull(8) ? null : reader.GetString(8),
                    nombre_usuario = reader.GetString(9),
                    correo_usuario = reader.GetString(10),
                    titulo_servicio = reader.IsDBNull(11) ? null : reader.GetString(11),
                });
            }

            return Ok(lista);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { ok = false, error = ex.Message });
        }
    }

    // ── PATCH /api/reportes/{id}/estado ── Admin actualiza el estado de un reporte
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarReporteDTO dto)
    {
        try
        {
            Console.WriteLine($"[PATCH] id={id} estado={dto.estado} notas={dto.resolucion_notas} admin={dto.id_admin}");

            using var conn = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            using var cmd = new NpgsqlCommand(@"
            UPDATE reportes
            SET estado = @estado,
                resolucion_notas = @notas,
                id_admin_responde = @id_admin
            WHERE id_reporte = @id
        ", conn);

            cmd.Parameters.AddWithValue("@estado", dto.estado);
            cmd.Parameters.AddWithValue("@notas", string.IsNullOrEmpty(dto.resolucion_notas) ? DBNull.Value : (object)dto.resolucion_notas);
            cmd.Parameters.AddWithValue("@id_admin", dto.id_admin > 0 ? (object)dto.id_admin : DBNull.Value);
            cmd.Parameters.AddWithValue("@id", id);

            Console.WriteLine($"[PATCH] Ejecutando query...");
            int rows = await cmd.ExecuteNonQueryAsync();
            Console.WriteLine($"[PATCH] Filas afectadas: {rows}");

            if (rows == 0)
                return NotFound(new { ok = false, error = "Reporte no encontrado." });

            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PATCH ERROR] {ex.GetType().Name}: {ex.Message}");
            Console.WriteLine($"[PATCH ERROR] Inner: {ex.InnerException?.Message}");
            Console.WriteLine($"[PATCH ERROR] Stack: {ex.StackTrace}");
            return StatusCode(500, new { ok = false, error = ex.Message, inner = ex.InnerException?.Message });
        }
    }
}