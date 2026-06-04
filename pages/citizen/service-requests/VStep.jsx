// pages/citizen/service-requests/VStep.jsx
// Vertical step item used in the service request form stepper.

export default function VStep({ num, state, title, badge, badgeType, last, children }) {
  return (
    <div className="vstep">
      <div className="vstep-rail">
        <div className={`vstep-num vstep-num--${state}`}>
          {state === "done" ? "✓" : num}
        </div>
        {!last && <div className={`vstep-line vstep-line--${state}`} />}
      </div>
      <div className="vstep-content">
        <div className="vstep-label-row">
          <span className={`vstep-title vstep-title--${state}`}>{title}</span>
          <span className={`vstep-badge vstep-badge--${badgeType}`}>{badge}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
