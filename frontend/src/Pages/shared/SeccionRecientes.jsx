import TarjetaServicio from "./TarjetaServicio";

export default function SeccionRecientes({ servicios, cargando, linkBase }) {
  return (
    <section className="seccion" id="recientes">
      <div className="bg-canvas bg-canvas-circuit" />
      <div className="container">
        <p className="label-seccion reveal"><i className="bi bi-clock-history"></i> Recién publicados</p>
        <h2 className="reveal delay-1">Servicios más recientes</h2>
        <p className="seccion-desc reveal delay-2">
          Los últimos servicios añadidos por la comunidad
        </p>

        {cargando ? (
          <p className="texto-muted reveal delay-3" style={{ textAlign: "center", padding: "40px 0" }}>
            Cargando servicios...
          </p>
        ) : servicios.length === 0 ? (
          <div className="texto-muted" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center", padding: "16px 0" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="80" height="80" style={{ shapeRendering: "auto", display: "block", background: "transparent" }} xmlnsXlink="http://www.w3.org/1999/xlink">
              <g>
                <path style={{ transform: "scale(0.8)", transformOrigin: "50px 50px", stroke: "var(--teal)" }} strokeLinecap="round" d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" strokeDasharray="218.10058898925783 38.48833923339842" strokeWidth="2" fill="none">
                  <animate values="0;256.58892822265625" keyTimes="0;1" dur="1.5625s" repeatCount="indefinite" attributeName="stroke-dashoffset"></animate>
                </path>
              </g>
            </svg>
            <span style={{ fontSize: "0.75rem", color: "var(--teal)" }}>Cargando servicios</span>
          </div>
        ) : (
          <div id="contenedor-tarjetas" className="cards-3d-container">
            {servicios.map((s) => (
              <TarjetaServicio key={s.id_servicio} servicio={s} linkBase={linkBase} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
