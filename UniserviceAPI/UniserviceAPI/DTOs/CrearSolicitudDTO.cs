using System;
using System.Collections.Generic;

public class CrearSolicitudDTO
{
    public int id_cliente { get; set; }
    public int id_proveedor { get; set; }
    public int id_servicio { get; set; }

    public string tipo_servicio { get; set; }
    public string tema { get; set; }
    public string descripcion { get; set; }

    public DateTime? fecha_deseada { get; set; }
    public TimeSpan? hora_deseada { get; set; }

    public string? duracion { get; set; }
    public string? modalidad { get; set; }
    public string? metodo_pago { get; set; }
    public decimal presupuesto { get; set; }
    public bool pago_anticipado { get; set; }
    public string? urgencia { get; set; }
    public string? archivo { get; set; }
    
    // Campos personalizados por categoría (JSONB)
    public Dictionary<string, object>? campos_personalizados { get; set; }
}

public class ResponderSolicitudDTO
{
    public int id_solicitud { get; set; }
    public string accion { get; set; } // aceptar | rechazar
    public string? motivo_rechazo { get; set; }
    public decimal? contraoferta { get; set; }
}

public class CompletarSolicitudDTO
{
    public int id_solicitud { get; set; }
}
