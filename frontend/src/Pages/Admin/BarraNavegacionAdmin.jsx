// Barra de navegación lateral del panel de administración
// Renderiza los enlaces a cada sección y permite cerrar sesión
export default function NavbarAdmin({ seccionActual, setSeccion, onCerrarSesion }) {
  const adminNombre = localStorage.getItem("usuarioNombre") || localStorage.getItem("usuario") || "Administrador";

  // Define las secciones disponibles en el panel de administración
  const secciones = [
    { id: "dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard" },
    { id: "usuarios", icon: "bi-people-fill", label: "Usuarios" },
    { id: "servicios", icon: "bi-card-checklist", label: "Servicios" },
    { id: "pendientes", icon: "bi-hourglass-split", label: "Pendientes" },
    { id: "reportes", icon: "bi-flag-fill", label: "Reportes" },
    { id: "categorias", icon: "bi-tags-fill", label: "Categorías" },
    { id: "logs", icon: "bi-journal-text", label: "Actividad" },
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
            <i className={`bi ${s.icon}`}></i> {s.label}
          </button>
        ))}
      </div>

      <div className="admin-nav__user">
        <div className="admin-nav__user-info"><i className="bi bi-shield-fill-check"></i> {adminNombre}</div>
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
