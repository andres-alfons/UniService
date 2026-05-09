import { calcularEstrellas } from "./utilidades";

export default function SeccionDestacados({ top3, linkBase = "/servicio?id=" }) {
  return (
    <section className="seccion seccion-oscura" id="mejor-calificados">
      <div className="bg-canvas bg-canvas-stars" />
      <div className="container">
        <p className="label-seccion reveal"><i className="bi bi-trophy"></i> Top valorados</p>
        <h2 className="reveal delay-1">Servicios mejor calificados <i className="bi bi-star-fill"></i></h2>
        <p className="seccion-desc reveal delay-2">
          Ordenados por satisfacción de los usuarios
        </p>

        <div className="top-cards-3d">
          {top3.map((s, i) => (
            <a
              key={s.id_servicio}
              href={`${linkBase}${s.id_servicio}`}
              className={`top-card reveal-scale delay-${i + 1}`}
            >
              <div className="top-card-rank">
                <span className="rank-number">{i + 1}</span>
                <span className="rank-medal"><i className="bi bi-trophy"></i></span>
              </div>
              <div className="top-card-content">
                <div className="top-card-icon"><i className={`bi ${s.icono?.startsWith("bi-") ? s.icono : "bi-pin"}`}></i></div>
                <h5>{s.titulo}</h5>
                <p className="top-card-meta">
                  {s.universidad === 1 || s.universidad === "1"
                    ? "Universidad Popular del Cesar"
                    : s.universidad === "No pertenece a ninguna universidad"
                    ? "Independiente"
                    : `${s.universidad || "Universidad no especificada"}`}
                </p>
                <div className="top-card-rating">
                  <span className="stars estrellas">
                    {calcularEstrellas(s.estrellas)}
                  </span>
                  <span className="rating-text">
                    {Array.isArray(s.estrellas) ? s.estrellas.length : 0} puntuaciones
                  </span>
                </div>
                <div className="top-card-footer">
                  <div className="author">
                    <div className="top3 top3-verde"><i className="bi bi-person"></i></div>
                    <span>{s.proveedor || "Anónimo"}</span>
                  </div>
                  <span className="price">${s.precio_hora || 0}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
