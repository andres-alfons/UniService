// Pie de página de la landing page para usuarios invitados
// muestra enlaces rápidos a plataforma, cuenta, categorías y soporte
export default function Footer() {
  return (
    <footer id="soporte">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <p className="logo">
              Uni<span>Servicios</span>
            </p>
            <p>
              La plataforma de intercambio de servicios entre estudiantes
              universitarios de Colombia.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <h5>Plataforma</h5>
            <div className="links-grid">
              <a href="#inicio">Inicio</a>
              <a href="#buscar">Buscar servicios</a>
              <a href="/login">Publicar servicio</a>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <h5>Mi cuenta</h5>
            <div className="links-grid">
              <a href="/login">Mis servicios</a>
              <a href="/login">Solicitudes</a>
              <a href="/login">Perfil</a>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <h5>Categorías</h5>
            <div className="links-grid">
              <a href="#buscar">Tutorías</a>
              <a href="#buscar">Ensayos</a>
              <a href="#buscar">Programación</a>
              <a href="#buscar">Diseño</a>
              <a href="#buscar">Arriendo</a>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <h5>Soporte</h5>
            <div className="links-grid">
              <a href="#">Centro de ayuda</a>
              <a href="/terms">Términos de uso</a>
              <a href="/privacy">Privacidad</a>
              <a href="#">Contacto</a>
            </div>
          </div>
        </div>
        <hr />
        <p className="footer-copy">
          © 2026 UniServicios — Hecho por y para estudiantes <i className="bi bi-mortarboard-fill"></i>
        </p>
      </div>
    </footer>
  );
}
