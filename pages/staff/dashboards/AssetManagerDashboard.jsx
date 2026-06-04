import { useState, useEffect } from "react";
import { StatCard, QuickAction } from "./DashboardShared";
import AssetService       from "../../../services/AssetService";
import InspectionService  from "../../../services/InspectionService";
import MaintenanceService from "../../../services/MaintenanceService";

export default function AssetManagerView({ navigate }) {
  const [stats,    setStats]    = useState({ totalAssets: "…", totalInspections: "…", totalMaintenance: "…" });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      AssetService.getAll(),
      InspectionService.getAll(),
      MaintenanceService.getAll(),
    ]).then(([assetResponse, inspectionResponse, maintenanceResponse]) => {
      const totalAssets      = assetResponse.status      === "fulfilled" ? (assetResponse.value.data?.data      ?? []).length : "—";
      const totalInspections = inspectionResponse.status === "fulfilled" ? (inspectionResponse.value.data?.data ?? []).length : "—";
      const totalMaintenance = maintenanceResponse.status === "fulfilled" ? (maintenanceResponse.value.data?.data ?? []).length : "—";
      setStats({ totalAssets, totalInspections, totalMaintenance });
      setIsLoaded(true);
    });
  }, []);

  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="🏗️" label="Total Assets"      value={isLoaded ? stats.totalAssets      : "…"} color="blue"  />
        <StatCard icon="📋" label="Total Inspections"  value={isLoaded ? stats.totalInspections : "…"} color="amber" />
        <StatCard icon="🛠️" label="Maintenance Tasks"  value={isLoaded ? stats.totalMaintenance : "…"} color="red"   />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="🏗️" label="View Assets"  onClick={() => navigate("/staff/assets")}       />
          <QuickAction icon="📋" label="Inspections"  onClick={() => navigate("/staff/inspections")}  />
          <QuickAction icon="🛠️" label="Maintenance"  onClick={() => navigate("/staff/maintenance")}  />
          <QuickAction icon="📰" label="View News"    onClick={() => navigate("/staff/news")}          />
        </div>
      </div>
    </>
  );
}
