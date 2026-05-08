const QuickStatCard = ({ icon, value, label }) => (
  <div className="quick-stat-card">
    <div className="quick-stat-icon">{icon}</div>
    <div className="quick-stat-value">{value}</div>
    <div className="quick-stat-label">{label}</div>
  </div>
);

export default QuickStatCard;
