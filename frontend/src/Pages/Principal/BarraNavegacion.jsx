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
    <nav className={`navbar-custom${scrolled ? " scrolled" : ""}`}>
      <div className="container">
        {/* Marca / logo */}
        <a href="#inicio" className="navbar-brand-custom">UniService</a>

        {/* Botón hamburguesa para menú responsive */}
        <button
          className={`nav-toggle${menuAbierto ? " active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>

        {/* Enlaces de navegación */}
        <div className={`navbar-links${menuAbierto ? " active" : ""}`}>
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
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </a>
          ))}
          {/* Enlace al perfil con nombre del usuario */}
          <a href="/perfil" className="nav-link-custom nav-iniciar">
            <i className="bi bi-person"></i> {nombreUsuario}
          </a>
          {/* Botón para cerrar sesión */}
          <button type="button" className="nav-Cerrar" onClick={onCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
