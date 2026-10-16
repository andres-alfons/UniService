// Cierre y pie en un solo campo: la invitación a publicar y el nombre, tan grande que el
// borde de la pantalla lo corta. Aquí van también los créditos de las fotos.
export default function Cierre({ accion }) {
  return (
    <footer className="us-cierre" aria-labelledby="cierre-titulo">
      <div className="us-cierre-arriba">
        <div className="us-cierre-invita" data-revela>
          <h2 id="cierre-titulo">¿Qué sabes<br />hacer bien?</h2>
          {accion.onClick ? (
            <button type="button" className="us-boton" onClick={accion.onClick}>{accion.label}</button>
          ) : (
            <a className="us-boton" href={accion.href}>{accion.label}</a>
          )}
        </div>
        <nav className="us-cierre-enlaces" aria-label="Pie de página" data-revela style={{ "--i": 1 }}>
          <a href="#buscar">Servicios</a>
          <a href="/terminos">Términos</a>
          <a href="/privacidad">Privacidad</a>
          <a href="mailto:uniservice.soporte@gmail.com?subject=Ayuda%20con%20UniService">Soporte</a>
        </nav>
      </div>

      <div className="us-cierre-legal">
        <p>© 2026 UniService · Hecho por estudiantes de la Universidad Popular del Cesar, Valledupar.</p>
        <p>
          Fotos: <a href="https://commons.wikimedia.org/w/index.php?curid=119346632">“Revolución en Marcha”</a>, Xavier Ardila,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=19117970">“Río Guatapurí”</a>, Jdvillalobos,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=18954722">“Sierra Nevada de Santa Marta”</a>, Taggen,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=79322542">“GON 2993”</a>, Andrés Felipe Paz Taborda,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Vía Wikimedia Commons.
        </p>
      </div>

      <div className="us-cierre-marca" aria-hidden="true">UniService</div>
    </footer>
  );
}
