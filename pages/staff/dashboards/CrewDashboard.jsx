import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffLayout        from "../../../components/staff/StaffLayout";
import WorkOrderService   from "../../../services/WorkOrderService";
import WorkLogService     from "../../../services/WorkLogService";
import DispatcherService  from "../../../services/DispatcherService";
import { CREW_STAT_CONFIG, CREW_ACTIONS } from "../../../utility/StaffHomeConfig";

// Named export — used as a widget inside StaffHomePage
export function CrewView({ navigate }) {
  const { userId } = useSelector((state) => state.auth);
  const staffId    = Number(userId);

  const [stats,    setStats]    = useState({ total: "…", notStarted: "…", inProgress: "…", completed: "…", withPhoto: "…" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      WorkOrderService.getAll(),
      WorkLogService.getAll(),
      DispatcherService.getAllFieldWorkers(),
    ]).then(([workOrderResponse, workLogResponse, fieldWorkerResponse]) => {
      const orders          = workOrderResponse.status   === "fulfilled" ? (workOrderResponse.value.data?.data   ?? []) : [];
      const logs            = workLogResponse.status     === "fulfilled" ? (workLogResponse.value.data?.data     ?? []) : [];
      const allFieldWorkers = fieldWorkerResponse.status === "fulfilled" ? (fieldWorkerResponse.value.data?.data ?? []) : [];

      const myFieldWorker = allFieldWorkers.find(fieldWorker => Number(fieldWorker.staffId) === staffId);
      const fieldWorkerId = myFieldWorker ? Number(myFieldWorker.fieldWorkerId) : null;

      const myOrders = fieldWorkerId !== null
        ? orders.filter(workOrder => workOrder.assignedFieldWorkerIds?.map(Number).includes(fieldWorkerId))
        : [];
      const myLogs = logs.filter(log => Number(log.performedBy) === staffId);

      setStats({
        total:      myOrders.length,
        notStarted: myOrders.filter(workOrder => workOrder.status === "NOT_STARTED").length,
        inProgress: myOrders.filter(workOrder => workOrder.status === "IN_PROGRESS").length,
        completed:  myOrders.filter(workOrder => workOrder.status === "COMPLETED").length,
        withPhoto:  myLogs.filter(log => log.photoUri).length,
      });
      setIsLoaded(true);
    });
  }, [staffId]);

  const crewStats = CREW_STAT_CONFIG.map(statConfig => ({
    ...statConfig,
    value: isLoaded ? stats[statConfig.statKey] : "…",
  }));

  return (
    <>
      <div className="sh-om-stats">
        {crewStats.map(crewStat => (
          <div key={crewStat.label} className="sh-om-card" style={{ borderColor: crewStat.border }}>
            <div className="sh-om-icon" style={{ background: crewStat.bg, color: crewStat.color }}>{crewStat.icon}</div>
            <div>
              <div className="sh-om-value" style={{ color: crewStat.color }}>{crewStat.value}</div>
              <div className="sh-om-label">{crewStat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sh-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 className="sh-section-title" style={{ margin: 0 }}>Quick Actions</h2>
          {isLoaded && (
            <span style={{ fontSize: 12.5, color: "#059669", fontWeight: 600, background: "#ecfdf5", padding: "4px 10px", borderRadius: 9999, border: "1px solid #a7f3d0" }}>
              📷 {stats.withPhoto} photo{stats.withPhoto !== 1 ? "s" : ""} uploaded
            </span>
          )}
        </div>
        <div className="sh-om-actions">
          {CREW_ACTIONS.map(action => (
            <button
              key={action.label}
              className="sh-om-action-btn"
              style={{ "--ac": action.color, "--abg": action.bg }}
              onClick={() => navigate(action.path)}
            >
              <span className="sh-om-action-icon" style={{ background: action.bg, color: action.color }}>{action.icon}</span>
              <span className="sh-om-action-label">{action.label}</span>
              <svg width="14" height="14" fill="none" stroke={action.color} strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: "auto", opacity: .7 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// Default export — used as a standalone routed page (/staff/crew)
export default function CrewDashboard() {
  const navigate = useNavigate();
  return (
    <StaffLayout>
      <CrewView navigate={navigate} />
    </StaffLayout>
  );
}
