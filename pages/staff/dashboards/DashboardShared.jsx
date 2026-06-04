export function StatCard({ icon, label, value, color }) {
  return (
    <div className={`sh-stat-card sh-stat-card--${color}`}>
      <div className="sh-stat-icon">{icon}</div>
      <div className="sh-stat-value">{value}</div>
      <div className="sh-stat-label">{label}</div>
    </div>
  );
}

export function QuickAction({ icon, label, onClick }) {
  return (
    <button className="sh-quick-action" onClick={onClick}>
      <span className="sh-quick-action-icon">{icon}</span>
      <span className="sh-quick-action-label">{label}</span>
    </button>
  );
}
