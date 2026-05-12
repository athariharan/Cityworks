// pages/staff/operations/KpiPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import KpiService from "../../../services/KpiService";
import "../../../styles/KpiPage.css";

const PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

const PERIOD_META = {
  DAILY:     { bg: "#dbeafe", color: "#1e40af" },
  WEEKLY:    { bg: "#ede9fe", color: "#5b21b6" },
  MONTHLY:   { bg: "#d1fae5", color: "#065f46" },
  QUARTERLY: { bg: "#fef9c3", color: "#854d0e" },
  YEARLY:    { bg: "#fee2e2", color: "#991b1b" },
};

const EMPTY_FORM = {
  name: "", definition: "", target: "", currentValue: "", reportingPeriod: "",
};

export default function KpiPage() {
  const navigate  = useNavigate();
  const [kpis,     setKpis]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => { fetchKpis(); }, []);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const res = await KpiService.getAll();
      setKpis(res.data?.data || []);
    } catch {
      showToast("Failed to load KPIs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.reportingPeriod) {
      showToast("Name and Reporting Period are required", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name:            form.name.trim(),
      definition:      form.definition.trim() || null,
      target:          form.target       ? parseFloat(form.target)       : null,
      currentValue:    form.currentValue ? parseFloat(form.currentValue) : null,
      reportingPeriod: form.reportingPeriod,
    };
    try {
      if (editId) {
        await KpiService.update(editId, payload);
        showToast("KPI updated successfully");
        setEditId(null);
      } else {
        await KpiService.create(payload);
        showToast("KPI created successfully");
      }
      setForm(EMPTY_FORM);
      fetchKpis();
    } catch {
      showToast(editId ? "Update failed" : "Create failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (kpi) => {
    setEditId(kpi.kpiId);
    setForm({
      name:            kpi.name            || "",
      definition:      kpi.definition      || "",
      target:          kpi.target        != null ? String(kpi.target)       : "",
      currentValue:    kpi.currentValue  != null ? String(kpi.currentValue) : "",
      reportingPeriod: kpi.reportingPeriod || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this KPI?")) return;
    setDeleting(id);
    try {
      await KpiService.remove(id);
      showToast("KPI deleted");
      fetchKpis();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => { setEditId(null); setForm(EMPTY_FORM); };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const pct = (kpi) => {
    if (kpi.target == null || kpi.currentValue == null || kpi.target === 0) return null;
    return Math.min(100, Math.round((kpi.currentValue / kpi.target) * 100));
  };

  const filtered = kpis.filter(k =>
    !search ||
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    (k.definition || "").toLowerCase().includes(search.toLowerCase()) ||
    (k.reportingPeriod || "").includes(search.toUpperCase())
  );

  return (
    <StaffLayout>
      <div className="kp-root">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="kp-hero">
          <div className="kp-hero-blob" />
          <div className="kp-hero-left">
            <div className="kp-breadcrumb">
              <span className="kp-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="kp-bc-active">KPI Management</span>
            </div>
            <h1 className="kp-title">KPI Management</h1>
            <p className="kp-subtitle">Create, track, and monitor Key Performance Indicators for operational excellence</p>
          </div>
          <div className="kp-hero-right">
            <div className="kp-hero-count">
              <div className="kp-hero-count-val">{kpis.length}</div>
              <div className="kp-hero-count-lbl">KPIs Defined</div>
            </div>
            <button className="kp-refresh-btn" onClick={fetchKpis}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="kp-layout">

          {/* ── Form Panel ──────────────────────────────────── */}
          <div className="kp-form-panel">
            <div className={`kp-form-header ${editId ? "kp-form-header--edit" : ""}`}>
              <div className="kp-form-header-icon">
                {editId ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5"  y1="12" x2="19" y2="12"/>
                  </svg>
                )}
              </div>
              <div>
                <div className="kp-form-header-title">
                  {editId ? `Edit KPI #${editId}` : "Create New KPI"}
                </div>
                <div className="kp-form-header-sub">
                  {editId ? "Update the KPI details below" : "Fill in the details to define a KPI"}
                </div>
              </div>
            </div>

            <form className="kp-form" onSubmit={handleSubmit}>

              <div className="kp-field">
                <label className="kp-label">
                  KPI Name <span className="kp-req">*</span>
                </label>
                <input
                  name="name"
                  className="kp-input"
                  placeholder="e.g. Work Order Completion Rate"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="kp-field">
                <label className="kp-label">Definition</label>
                <textarea
                  name="definition"
                  className="kp-input kp-textarea"
                  placeholder="Describe what this KPI measures…"
                  value={form.definition}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="kp-row2">
                <div className="kp-field">
                  <label className="kp-label">Target Value</label>
                  <input
                    name="target"
                    type="number"
                    step="0.01"
                    className="kp-input"
                    placeholder="e.g. 100"
                    value={form.target}
                    onChange={handleChange}
                  />
                </div>
                <div className="kp-field">
                  <label className="kp-label">Current Value</label>
                  <input
                    name="currentValue"
                    type="number"
                    step="0.01"
                    className="kp-input"
                    placeholder="e.g. 82"
                    value={form.currentValue}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="kp-field">
                <label className="kp-label">
                  Reporting Period <span className="kp-req">*</span>
                </label>
                <select
                  name="reportingPeriod"
                  className="kp-input kp-select"
                  value={form.reportingPeriod}
                  onChange={handleChange}
                >
                  <option value="">Select period…</option>
                  {PERIODS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="kp-form-actions">
                <button type="submit" className="kp-btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="kp-spinner" />
                      Saving…
                    </>
                  ) : editId ? (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Update KPI
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Create KPI
                    </>
                  )}
                </button>
                {editId && (
                  <button type="button" className="kp-btn-ghost" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* ── KPI List Panel ──────────────────────────────── */}
          <div className="kp-list-panel">
            <div className="kp-list-header">
              <div className="kp-list-title-wrap">
                <svg width="15" height="15" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span className="kp-list-title">All KPIs</span>
                <span className="kp-list-count">{kpis.length}</span>
              </div>
              <div className="kp-search-wrap">
                <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="kp-search"
                  placeholder="Search KPIs…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="kp-loading">
                <div className="kp-spinner-lg" />
                Loading KPIs…
              </div>
            ) : filtered.length === 0 ? (
              <div className="kp-empty">
                <svg width="44" height="44" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p>{search ? "No KPIs match your search." : "No KPIs yet. Create your first KPI."}</p>
              </div>
            ) : (
              <div className="kp-table">

                <div className="kp-table-head">
                  <span>Name</span>
                  <span>Period</span>
                  <span>Values</span>
                  <span>Progress</span>
                  <span>Actions</span>
                </div>

                {filtered.map(kpi => {
                  const p  = pct(kpi);
                  const pm = PERIOD_META[kpi.reportingPeriod] || {};
                  const barColor = p == null ? "#94a3b8"
                                 : p >= 100  ? "#22c55e"
                                 : p >= 70   ? "#f59e0b"
                                 : "#ef4444";
                  return (
                    <div key={kpi.kpiId} className={`kp-row${editId === kpi.kpiId ? " kp-row--editing" : ""}`}>

                      <div className="kp-row-name">
                        <span className="kp-row-title">{kpi.name}</span>
                        {kpi.definition && (
                          <span className="kp-row-def">{kpi.definition}</span>
                        )}
                      </div>

                      <span className="kp-period-badge" style={{ background: pm.bg, color: pm.color }}>
                        {kpi.reportingPeriod}
                      </span>

                      <div className="kp-row-vals">
                        <span className="kp-row-current" style={{ color: barColor }}>
                          {kpi.currentValue ?? "—"}
                        </span>
                        <span className="kp-row-sep">/</span>
                        <span className="kp-row-target">{kpi.target ?? "—"}</span>
                      </div>

                      <div className="kp-row-progress">
                        {p != null ? (
                          <>
                            <div className="kp-bar">
                              <div className="kp-bar-fill" style={{ width: `${p}%`, background: barColor }} />
                            </div>
                            <span className="kp-bar-pct" style={{ color: barColor }}>{p}%</span>
                          </>
                        ) : (
                          <span className="kp-row-na">—</span>
                        )}
                      </div>

                      <div className="kp-row-actions">
                        <button className="kp-btn-edit" onClick={() => handleEdit(kpi)}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="kp-btn-delete"
                          disabled={deleting === kpi.kpiId}
                          onClick={() => handleDelete(kpi.kpiId)}
                        >
                          {deleting === kpi.kpiId ? (
                            <span className="kp-spinner-sm" />
                          ) : (
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          )}
                          {deleting === kpi.kpiId ? "…" : "Delete"}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Toast */}
        {toast && (
          <div className={`kp-toast kp-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              </svg>
            )}
            {toast.msg}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
