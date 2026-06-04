// pages/staff/work-orders/WorkOrdersPage.jsx
// Table listing all work orders for Dispatcher and Administrator roles — supports
// search, status filtering, and inline status updates via a slide-over detail panel.
import { useState, useEffect, useCallback } from "react";
import { useSelector }                       from "react-redux";
import StaffLayout                           from "../../../components/staff/StaffLayout";
import DispatcherService                     from "../../../services/DispatcherService";
import "../../../styles/WorkOrdersPage.css";
import { STATUS_CFG, PRIORITY_CFG, WO_FILTERS as FILTERS } from "../../../utility/WorkOrderConfig";
import { Badge, fmtShort }  from "./WorkOrderHelpers";
import WorkOrderDetailPanel from "./WorkOrderDetailPanel";
import { useToast } from "../../../utility/useToast";

export default function WorkOrdersPage() {
  const { role } = useSelector(state => state.auth);
  const isReadOnly = role === "CREW";

  const [allOrders,    setAllOrders]   = useState([]);
  const [isLoading,    setIsLoading]   = useState(false);
  const [search,       setSearch]      = useState("");
  const [filterStatus, setFilter]      = useState("ALL");
  const [selected,     setSelected]    = useState(null);
  const [updatingId,   setUpdatingId]  = useState(null);
  const [activeToast, displayToast] = useToast();

  const fetchWorkOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await DispatcherService.getAllWorkOrders();
      setAllOrders(response.data?.data || []);
    } catch {
      displayToast("Failed to load work orders.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

  const visible = allOrders.filter(wo => {
    const matchStatus = filterStatus === "ALL" || wo.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      String(wo.workOrderId).includes(q) ||
      String(wo.requestId || "").includes(q) ||
      (wo.description || "").toLowerCase().includes(q) ||
      (wo.priority    || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = allOrders.reduce((accumulator, workOrder) => {
    accumulator[workOrder.status] = (accumulator[workOrder.status] || 0) + 1;
    return accumulator;
  }, {});

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await DispatcherService.updateWorkOrder(id, { status });
      setAllOrders(previousOrders => previousOrders.map(wo => wo.workOrderId === id ? { ...wo, status } : wo));
      setSelected(previousSelected => previousSelected?.workOrderId === id ? { ...previousSelected, status } : previousSelected);
      displayToast("Status updated successfully.");
    } catch {
      displayToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <StaffLayout>
      <div className="wop-root">

        {/* ── Header ── */}
        <div className="wop-header">
          <button className="wop-btn-refresh" onClick={fetchWorkOrders} disabled={isLoading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {activeToast && <div className={`wop-toast wop-toast--${activeToast.toastType}`}>{activeToast.message}</div>}

        {/* ── Search ── */}
        <div className="wop-search-wrap">
          <svg className="wop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="wop-search-input"
            type="text"
            placeholder="Search by Work Order ID, Request ID, description or priority…"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          {search && <button className="wop-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* ── Filter tabs ── */}
        <div className="wop-filters">
          {FILTERS.map(filterItem => (
            <button
              key={filterItem.key}
              className={`wop-filter-btn ${filterStatus === filterItem.key ? "active" : ""}`}
              onClick={() => setFilter(filterItem.key)}
            >
              {filterItem.label}
              {(filterItem.key === "ALL" ? allOrders.length : counts[filterItem.key]) > 0 && (
                <span className="wop-filter-count">
                  {filterItem.key === "ALL" ? allOrders.length : counts[filterItem.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="wop-card">
          {isLoading ? (
            <div className="wop-empty">
              <div className="wop-spinner" />
              <p>Loading work orders…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div className="wop-empty-icon">🔧</div>
              <p className="wop-empty-msg">
                {search || filterStatus !== "ALL"
                  ? "No work orders match your filter."
                  : "No work orders found."}
              </p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>IDs</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Scheduled Start</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(wo => (
                    <tr key={wo.workOrderId} className="wop-row">

                      <td className="wop-td-ids">
                        <span className="wop-wo-id">WO #{wo.workOrderId}</span>
                        <span className="wop-req-id">Req #{wo.requestId || "—"}</span>
                      </td>

                      <td className="wop-td-desc">
                        <span className="wop-desc-text" title={wo.description}>
                          {wo.description
                            ? wo.description.length > 50
                              ? wo.description.slice(0, 50) + "…"
                              : wo.description
                            : "—"}
                        </span>
                      </td>

                      <td className="wop-td-badge"><Badge cfg={PRIORITY_CFG} value={wo.priority} /></td>
                      <td className="wop-td-badge"><Badge cfg={STATUS_CFG}   value={wo.status} /></td>

                      <td className="wop-td-date">{fmtShort(wo.scheduledStart)}</td>
                      <td className="wop-td-date">{fmtShort(wo.createdAt)}</td>

                      <td className="wop-td-action">
                        <button className="wop-btn-view" onClick={() => setSelected(wo)}>View</button>
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
        <WorkOrderDetailPanel
          wo={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
          readOnly={isReadOnly}
        />
      )}
    </StaffLayout>
  );
}
