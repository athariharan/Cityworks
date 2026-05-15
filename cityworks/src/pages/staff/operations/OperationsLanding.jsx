// pages/staff/operations/OperationsLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import WorkOrderService from "../../../services/WorkOrderService";
import WorkLogService from "../../../services/WorkLogService";
import KpiService from "../../../services/KpiService";
import "../../../styles/OperationsLanding.css";

export default function OperationsLanding() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState({ orders: "—", active: "—", logs: "—", kpis: "—", completed: "—" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      WorkOrderService.getAll(),
      WorkLogService.getAll(),
      KpiService.getAll(),
    ]).then(([wo, wl, kp]) => {
      const orders = wo.status === "fulfilled" ? (wo.value.data?.data ?? []) : [];
      const logs   = wl.status === "fulfilled" ? (wl.value.data?.data ?? []) : [];
      const kpis   = kp.status === "fulfilled" ? (kp.value.data?.data ?? []) : [];
      const active    = orders.filter(o => o.status === "NOT_STARTED" || o.status === "IN_PROGRESS").length;
      const completed = orders.filter(o => o.status === "COMPLETED").length;
      setStats({ orders: orders.length, active, logs: logs.length, kpis: kpis.length, completed });
      setLoading(false);
    });
  }, []);

  const MODULES = [
    {
      key:         "workorders",
      path:        "/staff/operations/workorders",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
      label:       "Work Orders",
      tagline:     "Priority & Severity Management",
      description: "View all active work orders and update priority levels. Escalate CRITICAL issues and manage field dispatch assignments.",
      stat:        stats.active,
      statLabel:   "Active Orders",
      color:       "#2563eb",
      lightBg:     "#eff6ff",
      borderColor: "#bfdbfe",
      btnLabel:    "Manage Priorities",
    },
    {
      key:         "worklogs",
      path:        "/staff/operations/worklogs/create",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      label:       "Work Logs",
      tagline:     "Field Activity Logging",
      description: "Create work logs for completed and in-progress work orders. Track timelines, worker activity, and upload photo evidence.",
      stat:        stats.logs,
      statLabel:   "Total Logs",
      color:       "#0d9488",
      lightBg:     "#f0fdfa",
      borderColor: "#99f6e4",
      btnLabel:    "Create Work Log",
    },
    {
      key:         "kpis",
      path:        "/staff/kpis",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      label:       "KPI Management",
      tagline:     "Performance Tracking",
      description: "Define KPIs, set targets, record current values and monitor operational performance across all reporting periods.",
      stat:        stats.kpis,
      statLabel:   "KPIs Defined",
      color:       "#7c3aed",
      lightBg:     "#f5f3ff",
      borderColor: "#ddd6fe",
      btnLabel:    "Manage KPIs",
    },
    {
      key:         "report",
      path:        "/staff/reports",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
          <path d="M15 7h2a5 5 0 0 1 0 10h-2"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      label:       "Completion Report",
      tagline:     "End-to-End Lifecycle View",
      description: "Full audit trail of every completed task — from citizen submission through validation, work order creation, field activity, to final sign-off.",
      stat:        stats.completed,
      statLabel:   "Completed Tasks",
      color:       "#059669",
      lightBg:     "#f0fdf4",
      borderColor: "#a7f3d0",
      btnLabel:    "View Report",
    },
  ];

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
              { v: stats.kpis,   l: "KPIs Tracked"   },
            ].map(s => (
              <div key={s.l} className="ol-stat-chip">
                <div className="ol-stat-val">{loading ? "…" : s.v}</div>
                <div className="ol-stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section Label ───────────────────────────────────── */}
        <div className="ol-section-label">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          Operations Modules
        </div>

        {/* ── Module Cards ────────────────────────────────────── */}
        <div className="ol-grid">
          {MODULES.map((mod, i) => (
            <div
              key={mod.key}
              className="ol-card"
              style={{
                "--c":       mod.color,
                "--cbg":     mod.lightBg,
                "--cborder": mod.borderColor,
                animationDelay: `${i * 0.1}s`,
              }}
              onClick={() => navigate(mod.path)}
            >
              <div className="ol-card-accent" />

              {/* Icon + live stat */}
              <div className="ol-card-top">
                <div className="ol-card-icon" style={{ background: mod.lightBg, color: mod.color }}>
                  {mod.icon}
                </div>
                <div className="ol-card-stat" style={{ background: mod.lightBg }}>
                  <span className="ol-card-stat-n" style={{ color: mod.color }}>
                    {loading ? "…" : mod.stat}
                  </span>
                  <span className="ol-card-stat-l" style={{ color: mod.color }}>
                    {mod.statLabel}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="ol-card-body">
                <h3 className="ol-card-title">{mod.label}</h3>
                <p className="ol-card-tagline" style={{ color: mod.color }}>{mod.tagline}</p>
                <p className="ol-card-desc">{mod.description}</p>
              </div>

              {/* CTA */}
              <button
                className="ol-card-cta"
                style={{ background: mod.color }}
                onClick={e => { e.stopPropagation(); navigate(mod.path); }}
              >
                {mod.btnLabel}
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
