export default function TarjetaPublicar({ onAbrir }) {
  return (
    <section className="seccion section-dynamic" id="publicar">
      <div className="bg-canvas bg-canvas-nodes" />
      <div className="floating-shapes-small">
        <div className="shape-sm shape-sm-1" /><div className="shape-sm shape-sm-2" />
      </div>
      <div className="container">
        <div className="publicar-compact-wrapper">
          <p className="label-seccion reveal">Nuevo servicio</p>
          <h2 className="reveal delay-1">Publicar servicio</h2>
          <p className="seccion-desc reveal delay-2">Comparte tu talento con la comunidad universitaria</p>

          <div className="publicar-card reveal delay-3" onClick={onAbrir} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(); } }} aria-label="Abrir formulario para publicar un nuevo servicio">
            <div className="publicar-card-bg">
              <div className="publicar-card-glow"></div>
              <div className="publicar-card-grid"></div>
            </div>
            <div className="publicar-card-content">
              <div className="publicar-card-icon">
                <i className="bi bi-plus-lg"></i>
              </div>
              <div className="publicar-card-text">
                <h3>Crear nuevo servicio</h3>
                <p>Define título, categoría, precio y detalles de tu servicio</p>
              </div>
              <div className="publicar-card-arrow">
                <i className="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>

          <div className="publicar-features reveal delay-4">
            <div className="pf-item">
              <i className="bi bi-image"></i>
              <span>Hasta 5 fotos</span>
            </div>
            <div className="pf-item">
              <i className="bi bi-geo-alt"></i>
              <span>Ubicación GPS</span>
            </div>
            <div className="pf-item">
              <i className="bi bi-clock"></i>
              <span>Revisión rápida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
