// pages/staff/operations/WorkOrderPriorityPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import WorkOrderService from "../../../services/WorkOrderService";
import "../../../styles/WorkOrderPriorityPage.css";
import { PRIORITIES, PRIORITY_META, STATUS_META } from "../../../utility/WorkOrderConfig";
import { WO_STAT_CONFIG } from "../../../utility/WorkOrderStatsConfig";
import { useToast } from "../../../utility/useToast";

export default function WorkOrderPriorityPage() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(null);
  const [edits,   setEdits]   = useState({});
  const [search,  setSearch]  = useState("");
  const [activeToast, displayToast] = useToast(3200);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await WorkOrderService.getAll();
      const data     = response.data?.data || [];
      setOrders(data);
      const initialEdits = {};
      data.forEach(order => { initialEdits[order.workOrderId] = order.priority; });
      setEdits(initialEdits);
    } catch {
      displayToast("Failed to load work orders", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePriorityChange = (id, value) =>
    setEdits(previousEdits => ({ ...previousEdits, [id]: value }));

  const handleSave = async (order) => {
    setIsSaving(order.workOrderId);
    try {
      await WorkOrderService.update(order.workOrderId, {
        description:            order.description,
        priority:               edits[order.workOrderId],
        status:                 order.status,
        assignedFieldWorkerIds: order.assignedFieldWorkerIds,
        scheduledStart:         order.scheduledStart,
      });
      setOrders(previousOrders => previousOrders.map(workOrder =>
        workOrder.workOrderId === order.workOrderId
          ? { ...workOrder, priority: edits[workOrder.workOrderId] }
          : workOrder
      ));
      displayToast(`Work Order #${order.workOrderId} updated to ${edits[order.workOrderId]}`);
    } catch {
      displayToast("Update failed. Please try again.", "error");
    } finally {
      setIsSaving(null);
    }
  };

  const filtered = orders.filter(o =>
    !search ||
    String(o.workOrderId).includes(search) ||
    (o.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const changed = (o) => edits[o.workOrderId] !== o.priority;

  const statsValues = {
    total:      orders.length,
    notStarted: orders.filter(o => o.status === "NOT_STARTED").length,
    inProgress: orders.filter(o => o.status === "IN_PROGRESS").length,
    critical:   orders.filter(o => o.priority === "CRITICAL").length,
  };
  const statItems = WO_STAT_CONFIG.map(cfg => ({ ...cfg, value: statsValues[cfg.statKey] }));

  return (
    <StaffLayout>
      <div className="wop-root">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="wop-hero">
          <div className="wop-hero-blob" />
          <div className="wop-hero-left">
            <div className="wop-breadcrumb">
              <span className="wop-bc-link" onClick={() => navigate("/staff/operations")}>
                Operations
              </span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="wop-bc-active">Work Order Priority</span>
            </div>
            <h1 className="wop-title">Work Order Priority</h1>
            <p className="wop-subtitle">Select a new priority for any work order and click Save to apply changes</p>
          </div>
          <button className="wop-refresh-btn" onClick={fetchAll}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="wop-stats-row">
          {statItems.map(statItem => (
            <div key={statItem.label} className={`wop-stat wop-stat--${statItem.color}`}>
              <div className="wop-stat-icon">{statItem.icon}</div>
              <div>
                <div className="wop-stat-value">{statItem.value}</div>
                <div className="wop-stat-label">{statItem.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ──────────────────────────────────────── */}
        <div className="wop-card">
          <div className="wop-card-header">
            <div className="wop-card-title-wrap">
              <svg width="16" height="16" fill="none" stroke="#1e40af" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
              <span className="wop-card-title">All Work Orders</span>
              <span className="wop-card-count">{filtered.length}</span>
            </div>
            <div className="wop-search-wrap">
              <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="wop-search"
                placeholder="Search by ID, description or status…"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="wop-loading">
              <div className="wop-spinner" />
              Loading work orders…
            </div>
          ) : filtered.length === 0 ? (
            <div className="wop-empty">
              <svg width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              <p>No work orders found.</p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Current Priority</th>
                    <th>Set Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const pm      = PRIORITY_META[order.priority] || {};
                    const sm      = STATUS_META[order.status]     || {};
                    const isDirty = changed(order);
                    const newPm   = PRIORITY_META[edits[order.workOrderId]] || {};
                    return (
                      <tr key={order.workOrderId} className={isDirty ? "wop-row--dirty" : ""}>
                        <td>
                          <span className="wop-id">#{order.workOrderId}</span>
                        </td>
                        <td>
                          <span className="wop-desc">
                            {order.description || <span className="wop-na">No description</span>}
                          </span>
                        </td>
                        <td>
                          <span className="wop-badge" style={{ background: sm.bg, color: sm.color }}>
                            <span className="wop-badge-dot" style={{ background: sm.color }} />
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <span className="wop-badge" style={{ background: pm.bg, color: pm.color }}>
                            <span className="wop-badge-dot" style={{ background: pm.dot }} />
                            {order.priority}
                          </span>
                        </td>
                        <td>
                          <select
                            className="wop-select"
                            style={isDirty ? { borderColor: newPm.dot, color: newPm.color } : {}}
                            value={edits[order.workOrderId] || order.priority}
                            onChange={event => handlePriorityChange(order.workOrderId, event.target.value)}
                          >
                            {PRIORITIES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className={`wop-save-btn${isDirty ? " wop-save-btn--active" : ""}`}
                            disabled={!isDirty || isSaving === order.workOrderId}
                            onClick={() => handleSave(order)}
                          >
                            {isSaving === order.workOrderId ? (
                              <>
                                <span className="wop-btn-spinner" />
                                Saving…
                              </>
                            ) : isDirty ? (
                              <>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Save
                              </>
                            ) : "Saved"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Toast */}
        {activeToast && (
          <div className={`wop-toast wop-toast--${activeToast.toastType}`}>
            {activeToast.toastType === "success" ? (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            {activeToast.message}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
