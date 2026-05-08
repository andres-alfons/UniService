import { useState } from "react";

export default function Navbar({ scrolled, onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const nombreUsuario = localStorage.getItem("usuarioNombre") || localStorage.getItem("usuario") || "Usuario";

  return (
    <nav className={`navbar-custom${scrolled ? " scrolled" : ""}`}>
      <div className="container">
        <a href="#inicio" className="navbar-brand-custom">UniService</a>

        <button
          className={`nav-toggle${menuAbierto ? " active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-links${menuAbierto ? " active" : ""}`}>
          {[
            ["#inicio", "Inicio"],
            ["#buscar", "Buscar servicios"],
            ["#mejor-calificados", "Top⭐"],
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
          <a href="/perfil" className="nav-link-custom nav-iniciar">
            👤 {nombreUsuario}
          </a>
          <button type="button" className="nav-Cerrar" onClick={onCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
