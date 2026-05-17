// ─── PiePagina.jsx ──────────────────────────────────────────────────────────
// Pie de página para usuarios autenticados con enlaces a plataforma,
// cuenta, categorías y soporte. Incluye copyright.
// ─────────────────────────────────────────────────────────────────────────────

// Componente del footer
export default function Footer() {
  return (
    <footer id="soporte">
      <div className="container">
        <div className="row g-4">
          {/* Descripción de la plataforma */}
          <div className="col-md-4">
            <p className="logo">
              Uni<span>Service</span>
            </p>
            <p>
              La plataforma de intercambio de servicios entre estudiantes
              universitarios de Colombia.
            </p>
          </div>
          {/* Enlaces de la plataforma */}
          <div className="col-6 col-md-2">
            <h5>Plataforma</h5>
            <div className="links-grid">
              <a href="#inicio">Inicio</a>
              <a href="#buscar">Buscar servicios</a>
              <a href="#publicar">Publicar servicio</a>
            </div>
          </div>
          {/* Enlaces de la cuenta del usuario */}
          <div className="col-6 col-md-2">
            <h5>Mi cuenta</h5>
            <div className="links-grid">
              <a href="#mis-servicios">Mis servicios</a>
              <a href="#solicitudes">Solicitudes</a>
              <a href="/perfil">Perfil</a>
            </div>
          </div>
          {/* Enlaces rápidos por categoría */}
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
          {/* Enlaces de soporte y legales */}
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
        {/* Copyright */}
        <p className="footer-copy">
          © 2026 UniService — Hecho por y para estudiantes <i className="bi bi-mortarboard-fill"></i>
        </p>
      </div>
    </footer>
  );
}
