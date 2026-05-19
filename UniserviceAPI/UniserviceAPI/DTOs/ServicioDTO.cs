public class ServicioDTO
{
    public int id_proveedor { get; set; }
    public string titulo { get; set; }
    public string descripcion { get; set; }
    public int id_categoria { get; set; }
    public decimal precio_hora { get; set; }
    public string contacto { get; set; }
    public int modalidad { get; set; }
    public string icono { get; set; }
    public int disponibilidad { get; set; }
    
    // Google Maps - solo para categoría Arriendo
    public decimal? ubicacion_lat { get; set; }
    public decimal? ubicacion_lng { get; set; }
    public string? direccion { get; set; }
}

public class EditarServicioDTO
{
    public int id_proveedor { get; set; }
    public string titulo { get; set; }
    public string descripcion { get; set; }
    public decimal precio_hora { get; set; }
    public string contacto { get; set; }
    public string icono { get; set; }
    
    // Google Maps
    public decimal? ubicacion_lat { get; set; }
    public decimal? ubicacion_lng { get; set; }
    public string? direccion { get; set; }
}
