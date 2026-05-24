// ─── BarraNavegacion.jsx ─────────────────────────────────────────────────────
// Barra de navegación superior para usuarios autenticados.
// Incluye enlaces a las secciones principales, menú responsive,
// acceso al perfil y botón de cerrar sesión.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// Componente de la barra de navegación
export default function Navbar({ scrolled, onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Obtiene el nombre del usuario desde localStorage
  const nombreUsuario = localStorage.getItem("usuarioNombre") || localStorage.getItem("usuario") || "Usuario";

  return (
    <nav className={`navbar-custom${scrolled ? " scrolled" : ""}`} aria-label="Navegación principal">
      <div className="container">
        {/* Marca / logo */}
        <a href="#inicio" className="navbar-brand-custom" aria-label="UniService - Inicio"><span className="uni-brand">Uni</span><span className="service-brand">Service</span></a>

        {/* Botón hamburguesa para menú responsive */}
        <button
          className={`nav-toggle${menuAbierto ? " active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="nav-links"
        >
          <span /><span /><span />
        </button>

        {/* Enlaces de navegación */}
        <div id="nav-links" className={`navbar-links${menuAbierto ? " active" : ""}`} role="menubar">
          {[
            ["#inicio", "Inicio"],
            ["#buscar", "Buscar servicios"],
            ["#mejor-calificados", "Top destacados"],
            ["#publicar", "Publicar servicio"],
            ["#solicitudes", "Mis solicitudes"],
            ["#soporte", "Soporte"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="nav-link-custom"
              role="menuitem"
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </a>
          ))}
          {/* Enlace al perfil con nombre del usuario */}
          <a href="/perfil" className="nav-link-custom nav-iniciar" role="menuitem">
            <i className="bi bi-person" aria-hidden="true"></i> {nombreUsuario}
          </a>
          {/* Botón para cerrar sesión */}
          <button type="button" className="nav-Cerrar" role="menuitem" onClick={onCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
