// Tarjeta de estadística — Componente reutilizable para mostrar indicadores en el dashboard
// Recibe un ícono, etiqueta, valor, subtítulo y tipo de color (primary, success, info, danger)
export default function StatCard({ icon, label, value, sub, type }) {
  return (
    <div className={`admin-stat-card admin-stat-card--${type}`}>
      <div className="admin-stat-card__border-top" />
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__value">{value}</div>
      <div className="admin-stat-card__label">{label}</div>
      {sub && <div className="admin-stat-card__sub">{sub}</div>}
    </div>
  );
}
