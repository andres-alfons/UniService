import TarjetaServicio from "./TarjetaServicio";

export default function SeccionRecientes({ servicios, cargando, linkBase }) {
  return (
    <section className="seccion" id="recientes">
      <div className="bg-canvas bg-canvas-circuit" />
      <div className="container">
        <p className="label-seccion reveal">🕐 Recién publicados</p>
        <h2 className="reveal delay-1">Servicios más recientes</h2>
        <p className="seccion-desc reveal delay-2">
          Los últimos servicios añadidos por la comunidad
        </p>

        {cargando ? (
          <p className="texto-muted reveal delay-3" style={{ textAlign: "center", padding: "40px 0" }}>
            Cargando servicios...
          </p>
        ) : servicios.length === 0 ? (
          <p className="texto-muted reveal delay-3" style={{ textAlign: "center", padding: "40px 0" }}>
            Aún no hay servicios publicados.
          </p>
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
