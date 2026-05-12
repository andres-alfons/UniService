// Elemento de actividad reciente con icono, texto, hora, badge y tipo visual
const ActivityItem = ({ icon, text, time, badge, type }) => (
  <div className="activity-item">
    <div className="activity-icon">{icon}</div>
    <div className="activity-content">
      <div className="activity-text">{text}</div>
      <div className="activity-time">{time}</div>
    </div>
    <span className={`activity-badge ${type}`}>{badge}</span>
  </div>
);

export default ActivityItem;
