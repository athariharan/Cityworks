// pages/staff/crew/CrewWorkOrdersPage.jsx
// Read-only work order list for crew members — shows all orders with filters,
// and allows navigating to the evidence upload page for completed orders.
import { useState, useEffect, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import StaffLayout                           from "../../../components/staff/StaffLayout";
import WorkOrderService                      from "../../../services/WorkOrderService";
import "../../../styles/WorkOrdersPage.css";
import { STATUS_CFG, PRIORITY_CFG, WO_FILTERS as FILTERS } from "../../../utility/WorkOrderConfig";
import { fmt, buildCounts, filterOrders }                   from "../../../utility/CrewTasksConfig";
import { Badge }            from "../work-orders/WorkOrderHelpers";
import { useToast }                                         from "../../../utility/useToast";

// Crew-specific slide-over panel — read-only details with an evidence upload shortcut.
function CrewDetailPanel({ wo, onClose, onEvidence }) {
  const fields = [
    { lbl: "Scheduled Start",  val: fmt(wo.scheduledStart) },
    { lbl: "Scheduled End",    val: fmt(wo.scheduledEnd) },
    { lbl: "Asset ID",         val: wo.assetId || "—" },
    { lbl: "Assigned Workers", val: wo.assignedFieldWorkerIds?.length ? wo.assignedFieldWorkerIds.join(", ") : "None" },
  ];
  return (
    <div className="wop-overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="wop-panel">
        <div className="wop-panel-header">
          <div className="wop-panel-ids">
            <span className="wop-panel-wo">Work Order #{wo.workOrderId}</span>
            <span className="wop-panel-req">Request #{wo.requestId || "—"}</span>
          </div>
          <div className="wop-panel-badges">
            <Badge cfg={PRIORITY_CFG} value={wo.priority} />
            <Badge cfg={STATUS_CFG}   value={wo.status} />
            <button className="wop-panel-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="wop-panel-body">
          <div className="wop-panel-grid">
            <div className="wop-panel-field wop-panel-field--full">
              <span className="wop-panel-lbl">Description</span>
              <span className="wop-panel-val">{wo.description || "—"}</span>
            </div>
            {fields.map(field => (
              <div key={field.lbl} className="wop-panel-field">
                <span className="wop-panel-lbl">{field.lbl}</span>
                <span className="wop-panel-val">{field.val}</span>
              </div>
            ))}
          </div>
          {wo.status === "COMPLETED" && (
            <div className="wop-panel-status-section">
              <button onClick={() => onEvidence(wo)} style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                border: "none", background: "#1e40af", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>
                📷 Upload Evidence / Work Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CrewWorkOrdersPage() {
  const navigate = useNavigate();

  const [orders,       setOrders]       = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected,     setSelected]     = useState(null);
  const [activeToast, displayToast] = useToast();

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    WorkOrderService.getAll()
      .then(response => setOrders(response.data?.data ?? []))
      .catch(() => displayToast("Failed to load work orders.", "error"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const counts  = buildCounts(orders);
  const visible = filterOrders(orders, filterStatus, search);

  return (
    <StaffLayout>
      <div className="wop-root">
        {activeToast && <div className={`wop-toast wop-toast--${activeToast.toastType}`}>{activeToast.message}</div>}

        <div className="wop-search-wrap">
          <svg className="wop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="wop-search-input" type="text"
            placeholder="Search by Work Order ID, description or priority…"
            value={search} onChange={event => setSearch(event.target.value)} />
          {search && <button className="wop-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="wop-filters">
          {FILTERS.map(filterItem => (
            <button key={filterItem.key}
              className={`wop-filter-btn ${filterStatus === filterItem.key ? "active" : ""}`}
              onClick={() => setFilterStatus(filterItem.key)}>
              {filterItem.label}
              {counts[filterItem.key] > 0 && <span className="wop-filter-count">{counts[filterItem.key]}</span>}
            </button>
          ))}
        </div>

        <div className="wop-card">
          {isLoading ? (
            <div className="wop-empty"><div className="wop-spinner" /><p>Loading work orders…</p></div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div className="wop-empty-icon">🔧</div>
              <p className="wop-empty-msg">
                {search || filterStatus !== "ALL" ? "No work orders match your filter." : "No work orders found."}
              </p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>IDs</th><th>Description</th><th>Priority</th>
                    <th>Status</th><th>Scheduled Start</th><th>Due Date</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(workOrder => (
                    <tr key={workOrder.workOrderId} className="wop-row">
                      <td className="wop-td-ids">
                        <span className="wop-wo-id">WO #{workOrder.workOrderId}</span>
                        <span className="wop-req-id">Req #{workOrder.requestId || "—"}</span>
                      </td>
                      <td className="wop-td-desc">
                        <span className="wop-desc-text" title={workOrder.description}>
                          {workOrder.description ? (workOrder.description.length > 55 ? workOrder.description.slice(0, 55) + "…" : workOrder.description) : "—"}
                        </span>
                      </td>
                      <td className="wop-td-badge"><Badge cfg={PRIORITY_CFG} value={workOrder.priority} /></td>
                      <td className="wop-td-badge"><Badge cfg={STATUS_CFG}   value={workOrder.status} /></td>
                      <td className="wop-td-date">{fmt(workOrder.scheduledStart)}</td>
                      <td className="wop-td-date">{fmt(workOrder.scheduledEnd)}</td>
                      <td className="wop-td-action" style={{ display: "flex", gap: 6 }}>
                        <button className="wop-btn-view" onClick={() => setSelected(workOrder)}>View</button>
                        {workOrder.status === "COMPLETED" && (
                          <button
                            onClick={() => navigate("/staff/crew/evidence", { state: { workOrderId: workOrder.workOrderId } })}
                            style={{
                              padding: "5px 10px", borderRadius: 6,
                              border: "1.5px solid #a7f3d0", background: "#ecfdf5",
                              color: "#065f46", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            }}>
                            📷 Log
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <CrewDetailPanel
          wo={selected}
          onClose={() => setSelected(null)}
          onEvidence={workOrder => { setSelected(null); navigate("/staff/crew/evidence", { state: { workOrderId: workOrder.workOrderId } }); }}
        />
      )}
    </StaffLayout>
  );
}
