
export function NavCards({ links, navigate }) {
  return (
    <div className="nav-cards">
      {links.map(navItem => (
        <button key={navItem.path} className="nav-card" onClick={() => navigate(navItem.path)}>
          <div className="nav-card-ico" style={{ background: navItem.bg }}>{navItem.ico}</div>
          <span className="nav-card-lbl">{navItem.lbl}</span>
          <span className="nav-card-arr">›</span>
        </button>
      ))}
    </div>
  );
}

export function PanelInsight({ title, children }) {
  return (
    <div className="panel-insight">
      <div className="panel-insight-title">{title}</div>
      <p>{children}</p>
    </div>
  );
}
