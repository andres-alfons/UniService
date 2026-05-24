// Elemento de estadística con un valor numérico grande y su etiqueta descriptiva
const StatItem = ({ value, label }) => (
  <div className="stat-item" role="group" aria-label={label}>
    <div className="stat-value" aria-hidden="true">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default StatItem;
