// Elemento de menú del perfil con icono, título, descripción opcional, tag y flecha
const MenuItem = ({ icon, title, desc, tag, onClick, danger }) => (
  <div
    className="menu-item"
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}
    role="button"
    tabIndex={0}
    style={{
      cursor: "pointer",
      ...(danger && { borderColor: "rgba(239, 68, 68, 0.3)" }),
    }}
    aria-label={desc ? `${title} - ${desc}` : title}
  >
    <div
      className="menu-icon"
      style={danger ? { background: "rgba(239,68,68,0.15)" } : {}}
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="menu-text">
      {/* El título cambia de color si es una acción de peligro */}
      <div className="menu-title" style={danger ? { color: "#f87171" } : {}}>
        {title}
      </div>
      {desc && <div className="menu-desc">{desc}</div>}
    </div>
    {tag && <span className="status-tag online">{tag}</span>}
    <span className="menu-arrow" style={danger ? { color: "#f87171" } : {}} aria-hidden="true">
      →
    </span>
  </div>
);

export default MenuItem;
