// Tarjeta de presentación de un servicio con icono, categoría, título, descripción, autor y precio
import { formatearFecha } from "../../utils/helpers";
import { calcularEstrellas, truncar } from "./utilidades";
import { COLORES_CATEGORIA, ICONOS_POR_NOMBRE_CATEGORIA } from "./constantes";

export default function TarjetaServicio({ servicio, linkBase = "/servicio?id=" }) {
  const estrellas = calcularEstrellas(servicio.estrellas);
  const numReseñas = Array.isArray(servicio.estrellas)
    ? servicio.estrellas.length
    : 0;

  const colorCat = COLORES_CATEGORIA[servicio.nombre_categoria] || (servicio.nombre_categoria ? { bg: "rgba(148, 163, 184, 0.1)", color: "#94a3b8" } : null);

  const mostrarUniversidad = () => {
    const u = servicio.universidad;
    if (!u || u === "No pertenece a ninguna universidad" || u === "Sin universidad") return null;
    if (u === "1" || u === 1) return "Universidad Popular del Cesar";
    return u;
  };

  const uniTexto = mostrarUniversidad();

  // Obtener imagen de portada (primera imagen real, no default)
  const imagenesReales = (servicio.imagenes || [])
    .filter((img) => !img.url_imagen?.includes("default") && !img.url_imagen?.startsWith("img/"));
  const portada = imagenesReales.length > 0
    ? imagenesReales.find((img) => img.es_principal)?.url_imagen || imagenesReales[0].url_imagen
    : null;

  return (
    <a href={`${linkBase}${servicio.id_servicio}`} className="card-servicio card-3d">
      {/* Imagen de portada o icono de categoría */}
      {portada ? (
        <div className="card-icono card-icono-imagen">
          <img src={portada} alt={servicio.titulo} />
        </div>
      ) : (
        <div className="card-icono card-icono-azul">
          <i className={`bi ${ICONOS_POR_NOMBRE_CATEGORIA[servicio.nombre_categoria] || (servicio.icono?.startsWith("bi-") ? servicio.icono : "bi-pin")}`}></i>
        </div>
      )}
      <div className="card-body-custom">
        {colorCat && (
          <span className="etiqueta" style={{ background: colorCat.bg, color: colorCat.color, border: `1px solid ${colorCat.color}33` }}>
            {servicio.nombre_categoria}
          </span>
        )}
        {uniTexto && <p className="card-meta">{uniTexto}</p>}
        <h5>{servicio.titulo || "Sin título"}</h5>
        <p className="texto-muted">{truncar(servicio.descripcion)}</p>
        <div className="card-autor">
          <div
            className="avatar avatar-azul"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "50%",
              fontSize: "0.75rem", fontWeight: "700", flexShrink: 0,
            }}
          >
            {(servicio.proveedor || "?").charAt(0).toUpperCase()}
          </div>
          <span className="texto-muted">
            {servicio.proveedor || "Proveedor anónimo"}
          </span>
        </div>
        <div className="texto-fecha">
          {formatearFecha(servicio.fecha_publicacion) || ""}
        </div>
        <div className="card-footer">
          <div>
            <hr className="card-divider" />
            <div className="estrellas">{estrellas}</div>
            <div className="texto-muted">{numReseñas} reseñas</div>
          </div>
          <div className="precio">${servicio.precio_hora || 0}</div>
        </div>
      </div>
    </a>
  );
}
