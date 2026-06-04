import { useState, useEffect } from "react";
import { StatCard, QuickAction } from "./DashboardShared";
import WorkOrderService   from "../../../services/WorkOrderService";
import DispatcherService  from "../../../services/DispatcherService";

export default function DispatcherView({ navigate }) {
  const [stats,    setStats]    = useState({ pending: "…", totalWO: "…", totalCrew: "…" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      DispatcherService.getPendingRequests(),
      WorkOrderService.getAll(),
      DispatcherService.getAllFieldWorkers(),
    ]).then(([requestResponse, workOrderResponse, crewResponse]) => {
      const pending   = requestResponse.status   === "fulfilled" ? (requestResponse.value.data?.data   ?? []).length : "—";
      const totalWO   = workOrderResponse.status === "fulfilled" ? (workOrderResponse.value.data?.data ?? []).length : "—";
      const totalCrew = crewResponse.status      === "fulfilled" ? (crewResponse.value.data?.data      ?? []).length : "—";
      setStats({ pending, totalWO, totalCrew });
      setIsLoaded(true);
    });
  }, []);

  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="📋" label="Pending Requests"  value={isLoaded ? stats.pending   : "…"} color="blue"  />
        <StatCard icon="🔧" label="Total Work Orders" value={isLoaded ? stats.totalWO   : "…"} color="amber" />
        <StatCard icon="👥" label="Total Crew"        value={isLoaded ? stats.totalCrew : "…"} color="green" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📋" label="View Requests"     onClick={() => navigate("/staff/requests")}   />
          <QuickAction icon="🔧" label="Create Work Order" onClick={() => navigate("/staff/workorders")} />
          <QuickAction icon="👥" label="Manage Crews"      onClick={() => navigate("/staff/crews")}      />
          <QuickAction icon="📰" label="View News"         onClick={() => navigate("/staff/news")}       />
        </div>
      </div>
    </>
  );
}
