// Barra de navegación para usuarios autenticados dentro de la sección de servicio
function Navbar({ onCerrarSesion }) {
  return (
    <nav className="navbar-custom">
      <div className="container">
        <a href="/home" className="navbar-brand-custom">
          <span className="uni-brand">Uni</span><span className="service-brand">Service</span>
        </a>
        <div className="navbar-links">
          <a href="/home#inicio" className="nav-link-custom">
            Inicio
          </a>
          <a href="/home#buscar" className="nav-link-custom">
            Servicios
          </a>
          <a href="/home#publicar" className="nav-link-custom">
            Publicar servicio
          </a>
          <a href="/perfil" className="nav-link-custom">
            Perfil
          </a>
          {/* Botón para cerrar sesión del usuario autenticado */}
          <button
            type="button"
            className="nav-link-custom nav-Cerrar"
            onClick={onCerrarSesion}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
