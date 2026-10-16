// Un servicio presentado como el volante que un estudiante pega en la cartelera:
// título grande, quién lo ofrece y, abajo, las tiras recortables que repiten el precio.
import { useState } from "react";

const SUFIJO = { hora: "/h", mes: "/mes", proyecto: " c/u" };
const TONOS = ["amarillo", "verde", "negro"];

export function precioCorto(precio, unidad) {
  return `$${Number(precio || 0).toLocaleString("es-CO")}${SUFIJO[unidad] || ""}`;
}

export default function Volante({ servicio: s, linkBase = "/servicio?id=" }) {
  const [sinImagen, setSinImagen] = useState(!s.imagen);
  const precio = precioCorto(s.precio_hora, s.unidad_precio);
  const promedio = Number(s.promedio) || 0;

  return (
    <a
      href={`${linkBase}${s.id_servicio}`}
      className="us-volante"
      aria-label={`${s.titulo}, ${s.categoria || "servicio"}, por ${s.proveedor}, ${precio}`}
    >
      <div className="us-volante-foto">
        {sinImagen ? (
          <div className="us-volante-sinfoto" data-tono={TONOS[(s.id_categoria || 0) % TONOS.length]} aria-hidden="true">
            {s.categoria || "Servicio"}
          </div>
        ) : (
          <img
            src={s.imagen}
            alt=""
            width="400"
            height="300"
            loading="lazy"
            decoding="async"
            onError={() => setSinImagen(true)}
          />
        )}
      </div>
      <div className="us-volante-texto">
        <span className="us-volante-cat">{s.categoria}</span>
        <h3>{s.titulo}</h3>
        {s.descripcion && <p className="us-volante-desc">{s.descripcion}</p>}
        <div className="us-volante-quien">
          <span>{s.proveedor}</span>
          <span>{s.num_resenas > 0 ? `${promedio.toFixed(1)} · ${s.num_resenas} ${s.num_resenas === 1 ? "reseña" : "reseñas"}` : "Nuevo"}</span>
        </div>
      </div>
      <div className="us-tiras" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span className="us-tira" key={i}>{precio}</span>
        ))}
      </div>
    </a>
  );
}

export function VolanteCargando() {
  return (
    <div className="us-volante us-volante--cargando" aria-hidden="true">
      <div className="us-volante-foto" />
      <div className="us-volante-texto">
        <span className="us-esq" style={{ width: "40%" }} />
        <span className="us-esq us-esq--titulo" />
        <span className="us-esq" />
      </div>
    </div>
  );
}
