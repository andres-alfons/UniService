import { formatearFecha } from "../../utils/helpers";
import { calcularEstrellas, truncar } from "./utilidades";
import { COLORES_CATEGORIA } from "./constantes";

export default function TarjetaServicio({ servicio, linkBase = "/servicio?id=" }) {
  const estrellas = calcularEstrellas(servicio.estrellas);
  const numReseñas = Array.isArray(servicio.estrellas)
    ? servicio.estrellas.length
    : 0;

  const colorCat = COLORES_CATEGORIA[servicio.nombre_categoria] || COLORES_CATEGORIA["Otros servicios"];

  const universidad =
    servicio.universidad === 1 || servicio.universidad === "1"
      ? "Universidad Popular del Cesar"
      : servicio.universidad === "No pertenece a ninguna universidad"
      ? "Independiente"
      : `${servicio.universidad || "Universidad no especificada"}`;

  return (
    <a href={`${linkBase}${servicio.id_servicio}`} className="card-servicio card-3d">
      <div className="card-icono card-icono-azul"><i className={`bi ${servicio.icono?.startsWith("bi-") ? servicio.icono : "bi-pin"}`}></i></div>
      <div className="card-body-custom">
        <span className="etiqueta" style={{ background: colorCat.bg, color: colorCat.color, border: `1px solid ${colorCat.color}33` }}>
          {servicio.nombre_categoria || "Categoría no especificada"}
        </span>
        <p className="card-meta">{universidad}</p>
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
