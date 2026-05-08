export default function NavbarAdmin({ seccionActual, setSeccion, onCerrarSesion }) {
  const adminNombre = localStorage.getItem("usuario") || "Administrador";

  const secciones = [
    { id: "dashboard", icon: "⬛", label: "Dashboard" },
    { id: "usuarios", icon: "👥", label: "Usuarios" },
    { id: "servicios", icon: "📋", label: "Servicios" },
    { id: "reportes", icon: "🚩", label: "Reportes" },
    { id: "categorias", icon: "🏷️", label: "Categorías" },
    { id: "logs", icon: "📜", label: "Actividad" },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav__logo-container">
        <div className="admin-nav__logo-icon">A</div>
        <span className="admin-nav__logo-text">
          Uni<span className="admin-nav__logo-text--highlight">Admin</span>
        </span>
        <span className="admin-nav__badge-internal">PANEL INTERNO</span>
      </div>

      <div className="admin-nav__links">
        {secciones.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSeccion(s.id)}
            className={`admin-nav__btn ${seccionActual === s.id ? "is-active" : ""}`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="admin-nav__user">
        <div className="admin-nav__user-info">🛡️ {adminNombre}</div>
        <button
          type="button"
          onClick={onCerrarSesion}
          className="admin-nav__logout"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
