const MenuItem = ({ icon, title, desc, tag, onClick, danger }) => (
  <div
    className="menu-item"
    onClick={onClick}
    style={{
      cursor: "pointer",
      ...(danger && { borderColor: "rgba(239, 68, 68, 0.3)" }),
    }}
  >
    <div
      className="menu-icon"
      style={danger ? { background: "rgba(239,68,68,0.15)" } : {}}
    >
      {icon}
    </div>
    <div className="menu-text">
      <div className="menu-title" style={danger ? { color: "#f87171" } : {}}>
        {title}
      </div>
      {desc && <div className="menu-desc">{desc}</div>}
    </div>
    {tag && <span className="status-tag online">{tag}</span>}
    <span className="menu-arrow" style={danger ? { color: "#f87171" } : {}}>
      →
    </span>
  </div>
);

export default MenuItem;
