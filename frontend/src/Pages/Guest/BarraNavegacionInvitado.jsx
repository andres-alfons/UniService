// Barra de navegación para usuarios invitados (no autenticados)
// Muestra enlaces a secciones de la landing page y botón para iniciar sesión
import { useState } from "react";

export default function Navbar({ scrolled }) {
  // Controla si el menú responsive está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <nav
      className={`navbar-custom${scrolled ? " scrolled" : ""}`}
      id="var-navbar"
    >
      <div className="container">
        <a href="#inicio" className="navbar-brand-custom">
          <span className="uni-brand">Uni</span><span className="service-brand">Service</span>
        </a>

        {/* Botón de menú hamburguesa para dispositivos móviles */}
        <button
          className={`nav-toggle${menuAbierto ? " active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Enlaces de navegación con clase activa cuando el menú está abierto */}
        <div className={`navbar-links${menuAbierto ? " active" : ""}`}>
          {[
            ["#inicio", "Inicio"],
            ["#buscar", "Buscar servicios"],
            ["#mejor-calificados", "Top destacados"],
            ["#soporte", "Soporte"],
          ].map(([href, label]) => (
            // Enlace a cada sección de la landing page
            <a
              key={href}
              href={href}
              className="nav-link-custom"
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </a>
          ))}
          {/* Botón destacado para iniciar sesión */}
          <a href="/login" className="nav-link-custom nav-iniciar">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  );
}
