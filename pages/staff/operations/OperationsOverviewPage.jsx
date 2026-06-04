// pages/staff/operations/OperationsLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import WorkOrderService from "../../../services/WorkOrderService";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/OperationsLanding.css";
import { OPERATIONS_MODULES } from "../../../utility/OperationsConfig";

export default function OperationsLanding() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({ orders: "—", active: "—", logs: "—", completed: "—" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      WorkOrderService.getAll(),
      WorkLogService.getAll(),
    ]).then(([workOrderResult, workLogResult]) => {
      const orders = workOrderResult.status === "fulfilled" ? (workOrderResult.value.data?.data ?? []) : [];
      const logs   = workLogResult.status   === "fulfilled" ? (workLogResult.value.data?.data  ?? []) : [];
      const active    = orders.filter(order => order.status === "NOT_STARTED" || order.status === "IN_PROGRESS").length;
      const completed = orders.filter(order => order.status === "COMPLETED").length;
      setStats({ orders: orders.length, active, logs: logs.length, completed });
      setIsLoading(false);
    });
  }, []);

  const MODULES = OPERATIONS_MODULES.map(moduleItem => ({ ...moduleItem, stat: stats[moduleItem.statKey] }));

  return (
    <StaffLayout>
      <div className="ol-root">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="ol-hero">

          {/* decorative circles */}
          <div className="ol-hero-blob ol-hero-blob--1" />
          <div className="ol-hero-blob ol-hero-blob--2" />

          <div className="ol-hero-left">
            <div className="ol-hero-badge">
              <span className="ol-hero-dot" />
              Operations Manager
            </div>
            <h1 className="ol-hero-title">Operations Control Centre</h1>
            <p className="ol-hero-sub">
              Manage work order priorities, log field activity, and monitor performance KPIs — all in one place.
            </p>
          </div>

          <div className="ol-hero-stats">
            {[
              { v: stats.orders, l: "Total Orders"  },
              { v: stats.active, l: "Active Orders"  },
              { v: stats.logs,   l: "Work Logs"      },
            ].map(statChip => (
              <div key={statChip.l} className="ol-stat-chip">
                <div className="ol-stat-val">{isLoading ? "…" : statChip.v}</div>
                <div className="ol-stat-lbl">{statChip.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ol-grid">
          {MODULES.map((moduleItem, moduleIndex) => (
            <div
              key={moduleItem.key}
              className="ol-card"
              style={{
                "--c":       moduleItem.color,
                "--cbg":     moduleItem.lightBg,
                "--cborder": moduleItem.borderColor,
                animationDelay: `${moduleIndex * 0.1}s`,
              }}
              onClick={() => navigate(moduleItem.path)}
            >
              <div className="ol-card-accent" />

              {/* Icon + live stat */}
              <div className="ol-card-top">
                <div className="ol-card-icon" style={{ background: moduleItem.lightBg, color: moduleItem.color }}>
                  {moduleItem.icon}
                </div>
                <div className="ol-card-stat" style={{ background: moduleItem.lightBg }}>
                  <span className="ol-card-stat-n" style={{ color: moduleItem.color }}>
                    {isLoading ? "…" : moduleItem.stat}
                  </span>
                  <span className="ol-card-stat-l" style={{ color: moduleItem.color }}>
                    {moduleItem.statLabel}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="ol-card-body">
                <h3 className="ol-card-title">{moduleItem.label}</h3>
                <p className="ol-card-tagline" style={{ color: moduleItem.color }}>{moduleItem.tagline}</p>
                <p className="ol-card-desc">{moduleItem.description}</p>
              </div>

              {/* CTA */}
              <button
                className="ol-card-cta"
                style={{ background: moduleItem.color }}
                onClick={event => { event.stopPropagation(); navigate(moduleItem.path); }}
              >
                {moduleItem.btnLabel}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

      </div>
    </StaffLayout>
  );
}
