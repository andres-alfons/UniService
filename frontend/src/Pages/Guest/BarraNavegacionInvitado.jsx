import { useState } from "react";

export default function Navbar({ scrolled }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <nav
      className={`navbar-custom${scrolled ? " scrolled" : ""}`}
      id="var-navbar"
    >
      <div className="container">
        <a href="#inicio" className="navbar-brand-custom">
          UniService
        </a>

        <button
          className={`nav-toggle${menuAbierto ? " active" : ""}`}
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links${menuAbierto ? " active" : ""}`}>
          {[
            ["#inicio", "Inicio"],
            ["#buscar", "Buscar servicios"],
            ["#mejor-calificados", "Top⭐"],
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
          <a href="/login" className="nav-link-custom nav-iniciar">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  );
}
