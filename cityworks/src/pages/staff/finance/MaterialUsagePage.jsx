// pages/staff/finance/MaterialUsagePage.jsx
import { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import MaterialUsageService from "../../../services/MaterialUsageService";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/MaterialUsagePage.css";

// ── helpers ─────────────────────────────────────────────────────
const fmt = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const EMPTY_FORM = {
  logId: "", workOrderId: "", assetId: "",
  partId: "", quantity: "", unitCost: "", totalCost: "",
};

// ── Stat chip ────────────────────────────────────────────────────
function StatChip({ icon, label, value, color }) {
  return (
    <div className="mu-stat" style={{ "--mc": color }}>
      <div className="mu-stat-icon">{icon}</div>
      <div className="mu-stat-body">
        <div className="mu-stat-value">{value}</div>
        <div className="mu-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── Modal Form ───────────────────────────────────────────────────
function UsageModal({ initial, worklogs, onSave, onClose, saving }) {
  const isEdit = !!initial?.usageId;
  const [form, setForm] = useState(
    isEdit
      ? {
          logId:       initial.logId       ?? "",
          workOrderId: initial.workOrderId ?? "",
          assetId:     initial.assetId     ?? "",
          partId:      initial.partId      ?? "",
          quantity:    initial.quantity    ?? "",
          unitCost:    initial.unitCost    ?? "",
          totalCost:   initial.totalCost   ?? "",
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  // auto-populate workOrderId when a worklog is chosen
  const handleLogChange = (e) => {
    const lid = e.target.value;
    const wl  = worklogs.find(w => String(w.logId) === String(lid));
    setForm(f => ({
      ...f,
      logId:       lid,
      workOrderId: wl ? wl.workOrderId ?? "" : f.workOrderId,
    }));
  };

  // auto-calculate totalCost
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "quantity" || name === "unitCost") {
        const q = parseFloat(name === "quantity" ? value : prev.quantity);
        const u = parseFloat(name === "unitCost"  ? value : prev.unitCost);
        if (!isNaN(q) && !isNaN(u)) next.totalCost = (q * u).toFixed(2);
        else next.totalCost = "";
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.logId)       e.logId       = "Work Log is required.";
    if (!form.workOrderId) e.workOrderId = "Work Order ID is required.";
    if (!form.assetId)     e.assetId     = "Asset ID is required.";
    if (!form.quantity || Number(form.quantity) <= 0)
      e.quantity = "Quantity must be > 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      logId:       Number(form.logId),
      workOrderId: Number(form.workOrderId),
      assetId:     Number(form.assetId),
      partId:      form.partId     ? Number(form.partId)     : null,
      quantity:    Number(form.quantity),
      unitCost:    form.unitCost  ? Number(form.unitCost)  : null,
      totalCost:   form.totalCost ? Number(form.totalCost) : null,
    });
  };

  return (
    <div className="mu-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mu-modal">

        <div className="mu-modal-header" style={{ background: isEdit ? "linear-gradient(135deg,#1e3a5f,#0d9488)" : "linear-gradient(135deg,#1e1b4b,#4f46e5)" }}>
          <div className="mu-modal-title-row">
            <div className="mu-modal-icon-wrap">
              {isEdit
                ? <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              }
            </div>
            <div>
              <h2 className="mu-modal-title">{isEdit ? "Edit Material Usage" : "New Material Usage"}</h2>
              <p className="mu-modal-sub">{isEdit ? `Editing record #${initial.usageId}` : "Record material consumed on a work log"}</p>
            </div>
          </div>
          <button className="mu-modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="mu-modal-body" onSubmit={handleSubmit} noValidate>

          {/* Work Log */}
          <div className="mu-field">
            <label className="mu-label">Work Log <span className="mu-req">*</span></label>
            {worklogs.length > 0 ? (
              <select
                className={`mu-select ${errors.logId ? "mu-input--err" : ""}`}
                name="logId"
                value={form.logId}
                onChange={handleLogChange}
              >
                <option value="">— Select work log —</option>
                {worklogs.map(wl => (
                  <option key={wl.logId} value={wl.logId}>
                    Log #{wl.logId} — WO #{wl.workOrderId ?? "?"} · {wl.status ?? ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={`mu-input ${errors.logId ? "mu-input--err" : ""}`}
                type="number"
                name="logId"
                placeholder="Enter Work Log ID"
                value={form.logId}
                onChange={handleChange}
              />
            )}
            {errors.logId && <span className="mu-err-msg">{errors.logId}</span>}
          </div>

          {/* Work Order ID */}
          <div className="mu-field">
            <label className="mu-label">Work Order ID <span className="mu-req">*</span></label>
            <input
              className={`mu-input ${errors.workOrderId ? "mu-input--err" : ""}`}
              type="number"
              name="workOrderId"
              placeholder="e.g. 3"
              value={form.workOrderId}
              onChange={handleChange}
            />
            {errors.workOrderId && <span className="mu-err-msg">{errors.workOrderId}</span>}
          </div>

          {/* Asset ID */}
          <div className="mu-field">
            <label className="mu-label">Asset ID <span className="mu-req">*</span></label>
            <input
              className={`mu-input ${errors.assetId ? "mu-input--err" : ""}`}
              type="number"
              name="assetId"
              placeholder="e.g. 12"
              value={form.assetId}
              onChange={handleChange}
            />
            {errors.assetId && <span className="mu-err-msg">{errors.assetId}</span>}
          </div>

          {/* Part ID */}
          <div className="mu-field">
            <label className="mu-label">Part ID <span className="mu-opt">(optional)</span></label>
            <input
              className="mu-input"
              type="number"
              name="partId"
              placeholder="e.g. 7"
              value={form.partId}
              onChange={handleChange}
            />
          </div>

          {/* Quantity */}
          <div className="mu-field">
            <label className="mu-label">Quantity <span className="mu-req">*</span></label>
            <input
              className={`mu-input ${errors.quantity ? "mu-input--err" : ""}`}
              type="number"
              name="quantity"
              placeholder="e.g. 10"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
            {errors.quantity && <span className="mu-err-msg">{errors.quantity}</span>}
          </div>

          {/* Unit Cost */}
          <div className="mu-field">
            <label className="mu-label">Unit Cost (₹) <span className="mu-opt">(optional)</span></label>
            <input
              className="mu-input"
              type="number"
              step="0.01"
              name="unitCost"
              placeholder="e.g. 250.00"
              value={form.unitCost}
              onChange={handleChange}
            />
          </div>

          {/* Total Cost — auto-calc read-only display */}
          {form.totalCost && (
            <div className="mu-field mu-field--full">
              <label className="mu-label">Total Cost (auto-calculated)</label>
              <div className="mu-total-display">
                ₹ {Number(form.totalCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div className="mu-modal-footer">
            <button type="button" className="mu-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="mu-btn-primary" disabled={saving}>
              {saving
                ? <><span className="mu-spinner" /> Saving…</>
                : isEdit ? "Save Changes" : "Create Record"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function MaterialUsagePage() {
  const [records,  setRecords]  = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(null);   // null | "create" | { record }
  const [search,   setSearch]   = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [muRes, wlRes] = await Promise.allSettled([
        MaterialUsageService.getAll(),
        WorkLogService.getAll(),
      ]);
      setRecords(muRes.status  === "fulfilled" ? muRes.value.data?.data  ?? [] : []);
      setWorklogs(wlRes.status === "fulfilled" ? wlRes.value.data?.data  ?? [] : []);
    } catch {
      showToast("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Stats ──
  const totalRecords  = records.length;
  const totalSpend    = records.reduce((s, r) => s + (Number(r.totalCost) || 0), 0);
  const avgCost       = totalRecords > 0 ? (totalSpend / totalRecords) : 0;

  // ── Filter ──
  const visible = records.filter(r => {
    const q = search.trim().toLowerCase();
    return !q ||
      String(r.usageId).includes(q) ||
      String(r.logId).includes(q) ||
      String(r.workOrderId).includes(q) ||
      String(r.assetId).includes(q);
  });

  // ── CRUD ──
  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (modal?.usageId) {
        await MaterialUsageService.update(modal.usageId, payload);
        showToast("Record updated successfully.");
      } else {
        await MaterialUsageService.create(payload);
        showToast("Record created successfully.");
      }
      setModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material usage record?")) return;
    setDeleting(id);
    try {
      await MaterialUsageService.remove(id);
      setRecords(prev => prev.filter(r => r.usageId !== id));
      showToast("Record deleted.");
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <StaffLayout>
      <div className="mu-root">

        {/* ── Hero ── */}
        <div className="mu-hero">
          <div className="mu-hero-blob mu-hero-blob--1" />
          <div className="mu-hero-blob mu-hero-blob--2" />
          <div className="mu-hero-content">
            <div>
              <div className="mu-hero-breadcrumb">Dashboard · Finance</div>
              <h1 className="mu-hero-title">Material Usage</h1>
              <p className="mu-hero-sub">Track materials consumed across work orders and work logs</p>
            </div>
            <button className="mu-hero-btn" onClick={() => setModal("create")}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Record
            </button>
          </div>
        </div>

        {toast && <div className={`mu-toast mu-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── Stat chips ── */}
        <div className="mu-stats-row">
          <StatChip icon="📦" label="Total Records"  value={totalRecords} color="#4f46e5" />
          <StatChip icon="💰" label="Total Spend"    value={fmt(totalSpend)} color="#0d9488" />
          <StatChip icon="📊" label="Avg Cost / Record" value={fmt(avgCost)} color="#d97706" />
        </div>

        {/* ── Toolbar ── */}
        <div className="mu-toolbar">
          <div className="mu-search-wrap">
            <svg className="mu-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="mu-search-input"
              placeholder="Search by Usage ID, Log ID, Work Order, Asset…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="mu-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          <button className="mu-btn-refresh" onClick={load} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="mu-card">
          {loading ? (
            <div className="mu-empty">
              <div className="mu-spinner-lg" />
              <p>Loading records…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="mu-empty">
              <div className="mu-empty-icon">📦</div>
              <p className="mu-empty-text">
                {search ? "No records match your search." : "No material usage records yet."}
              </p>
              {!search && (
                <button className="mu-btn-primary" onClick={() => setModal("create")}>
                  + Create First Record
                </button>
              )}
            </div>
          ) : (
            <div className="mu-table-wrap">
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Log ID</th>
                    <th>Work Order</th>
                    <th>Asset ID</th>
                    <th>Part ID</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(r => (
                    <tr key={r.usageId} className="mu-row">
                      <td className="mu-td-id">#{r.usageId}</td>
                      <td>
                        <span className="mu-log-badge">Log #{r.logId}</span>
                      </td>
                      <td>
                        <span className="mu-wo-badge">WO #{r.workOrderId}</span>
                      </td>
                      <td className="mu-td-plain">{r.assetId ?? "—"}</td>
                      <td className="mu-td-plain mu-td-muted">{r.partId ?? "—"}</td>
                      <td>
                        <span className="mu-qty-badge">{r.quantity}</span>
                      </td>
                      <td className="mu-td-cost">{fmt(r.unitCost)}</td>
                      <td className="mu-td-total">{fmt(r.totalCost)}</td>
                      <td className="mu-td-actions">
                        <button
                          className="mu-btn-edit"
                          title="Edit"
                          onClick={() => setModal(r)}
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="mu-btn-delete"
                          title="Delete"
                          disabled={deleting === r.usageId}
                          onClick={() => handleDelete(r.usageId)}
                        >
                          {deleting === r.usageId
                            ? <span className="mu-spinner" />
                            : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                          }
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Modal ── */}
      {modal && (
        <UsageModal
          initial={modal === "create" ? null : modal}
          worklogs={worklogs}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

    </StaffLayout>
  );
}
