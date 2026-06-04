// pages/staff/crew/CrewTasksPage.jsx
// Main task list for crew members — loads only the work orders assigned to the
// logged-in field worker, with status filters and a detail slide-over panel.
import { useState, useEffect, useCallback } from "react";
import { useSelector }                       from "react-redux";
import { useNavigate }                       from "react-router-dom";
import StaffLayout                           from "../../../components/staff/StaffLayout";
import WorkOrderService                      from "../../../services/WorkOrderService";
import DispatcherService                     from "../../../services/DispatcherService";
import "../../../styles/MyTasksPage.css";
import { buildCounts, filterOrders }         from "../../../utility/CrewTasksConfig";
import { WO_FILTERS as FILTERS }             from "../../../utility/WorkOrderConfig";
import TaskCard                              from "./CrewTaskCard";
import CrewTaskDetailPanel                   from "./CrewTaskDetailPanel";
import { useToast }                          from "../../../utility/useToast";

export default function MyTasksPage() {
  const navigate   = useNavigate();
  const { userId } = useSelector(state => state.auth);

  const [allOrders,    setAllOrders]    = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected,     setSelected]     = useState(null);
  const [activeToast, displayToast] = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const fieldWorkerResponse = await DispatcherService.getFieldWorkerByStaffId(userId);
      const fieldWorkerId       = fieldWorkerResponse.data?.data?.fieldWorkerId;

      if (!fieldWorkerId) {
        displayToast("Field worker profile not found for your account.", "error");
        setAllOrders([]);
        return;
      }

      const workOrderResponse = await WorkOrderService.getAll();
      const allWorkOrders     = workOrderResponse.data?.data ?? [];
      const myWorkOrders      = allWorkOrders.filter(workOrder => workOrder.assignedFieldWorkerIds?.includes(Number(fieldWorkerId)));
      setAllOrders(myWorkOrders);
    } catch {
      displayToast("Failed to load your tasks.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const counts  = buildCounts(allOrders);
  const visible = filterOrders(allOrders, filterStatus, search);

  const handleLog = (workOrder) => navigate("/staff/crew/evidence", { state: { workOrderId: workOrder.workOrderId } });

  return (
    <StaffLayout>
      <div className="mtask-root">

        {/* ── Header ── */}
        <div className="mtask-header">
          <div>
            <h1 className="mtask-title">My Tasks</h1>
            <p className="mtask-subtitle">
              {allOrders.length > 0
                ? `${allOrders.length} work order${allOrders.length > 1 ? "s" : ""} assigned to you`
                : "Work orders assigned to you"}
            </p>
          </div>
          <button className="mtask-btn-refresh" onClick={fetchTasks} disabled={isLoading}>🔄 Refresh</button>
        </div>

        {activeToast && <div className={`mtask-toast mtask-toast--${activeToast.toastType}`}>{activeToast.message}</div>}

        {/* ── Search ── */}
        <div className="mtask-search">
          <span className="mtask-search-icon">🔍</span>
          <input
            className="mtask-search-input"
            type="text"
            placeholder="Search by Work Order ID, description or priority…"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          {search && <button className="mtask-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* ── Status Filters ── */}
        <div className="mtask-filters">
          {FILTERS.map(filterItem => (
            <button
              key={filterItem.key}
              className={`mtask-filter-btn ${filterStatus === filterItem.key ? "active" : ""}`}
              onClick={() => setFilterStatus(filterItem.key)}
            >
              {filterItem.label}
              {counts[filterItem.key] > 0 && <span className="mtask-filter-count">{counts[filterItem.key]}</span>}
            </button>
          ))}
        </div>

        {/* ── Task Cards ── */}
        {isLoading ? (
          <div className="mtask-loading">
            <div className="mtask-spinner" />
            <p>Loading your tasks…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="mtask-empty">
            <div className="mtask-empty-icon">🔧</div>
            <p className="mtask-empty-title">
              {search || filterStatus !== "ALL" ? "No tasks match your filter." : "No tasks assigned to you yet."}
            </p>
            <p className="mtask-empty-sub">Check back later or contact your dispatcher.</p>
          </div>
        ) : (
          <div className="mtask-grid">
            {visible.map(workOrder => (
              <TaskCard
                key={workOrder.workOrderId}
                wo={workOrder}
                onView={setSelected}
                onLog={handleLog}
              />
            ))}
          </div>
        )}

      </div>

      {selected && (
        <CrewTaskDetailPanel
          wo={selected}
          onClose={() => setSelected(null)}
          onLog={workOrder => { setSelected(null); handleLog(workOrder); }}
        />
      )}
    </StaffLayout>
  );
}
