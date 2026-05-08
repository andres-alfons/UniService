const ProgressBar = ({ label, value, color }) => (
  <div className="progress-item">
    <div className="progress-header">
      <span className="progress-label">{label}</span>
      <span className="progress-value">{value}</span>
    </div>
    <div className="progress-bar">
      <div className={`progress-fill ${color}`} style={{ width: value }}></div>
    </div>
  </div>
);

export default ProgressBar;
