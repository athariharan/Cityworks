// pages/staff/asset/MaintenanceListPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { maintenanceService } from "../../../services/MaintenanceService";
import { assetService }       from "../../../services/AssetService";
import "../../../styles/AssetManager.css";
import StaffLayout from "../../../components/staff/StaffLayout";
import { STATUS_STYLES } from "../../../utility/MaintenanceConfig";
import { unwrap } from "../../../utility/ApiHelpers";

export default function MaintenanceListPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [tasks,     setTasks]     = useState([]);
  const [assetMap,  setAssetMap]  = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");

  const urlFilter = new URLSearchParams(location.search).get("filter") || "All";
  const [filter, setFilter] = useState(urlFilter);

  const fetchMaintenance = useCallback(async () => {
    setIsLoading(true); setError("");
    try {
      const [mRes, aRes] = await Promise.allSettled([
        maintenanceService.getAll(),
        assetService.getAll(),
      ]);

      if (mRes.status === "fulfilled") {
        setTasks(unwrap(mRes.value));
      } else {
        setError("Failed to load maintenance tasks.");
      }

      if (aRes.status === "fulfilled") {
        const map = {};
        unwrap(aRes.value).forEach(asset => { map[asset.assetId || asset.id] = asset.assetTag; });
        setAssetMap(map);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMaintenance(); }, [fetchMaintenance]);

  const filtered = tasks.filter(m => filter === "All" || m.status === filter);

  return (
    <StaffLayout>
      <div className="page-wrapper">
        <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Asset Management
        </button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Maintenance Tasks</h1>
            <p className="page-sub">
              {isLoading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-secondary" onClick={fetchMaintenance} disabled={isLoading}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => navigate("/staff/assets/maintenance")}>+ Schedule Task</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {error}
            <span className="alert-link" onClick={fetchMaintenance}>Retry</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b" }}>
            <div className="spinner" style={{ margin:"0 auto 12px", width:32, height:32 }} />
            <p>Loading maintenance tasks…</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="list-empty">
            <div className="list-empty-icon">🛠</div>
            <h3>No maintenance tasks scheduled yet</h3>
            <p>Start by scheduling your first maintenance task.</p>
            <button className="btn-primary" onClick={() => navigate("/staff/assets/maintenance")}>+ Schedule Task</button>
          </div>
        ) : (
          <>
            <div className="list-toolbar">
              <div className="list-filters">
                {["All","Scheduled","In_Progress","Completed"].map(filterOption => {
                  const statusStyle = STATUS_STYLES[filterOption];
                  return (
                    <button key={filterOption}
                      className={`filter-btn ${filter===filterOption?"filter-btn--active":""}`}
                      style={filter===filterOption && statusStyle ? {background:statusStyle.bg,color:statusStyle.color,borderColor:statusStyle.dot} : {}}
                      onClick={() => setFilter(filterOption)}>
                      {filterOption === "All" ? "All" : filterOption.replace("_"," ")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{padding:0}}>
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Scheduled At</th>
                    <th>Next Due</th>
                    <th>Task ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"#64748b"}}>No results</td></tr>
                  ) : filtered.map(maintenanceTask => {
                    const id          = maintenanceTask.id ?? maintenanceTask.taskId ?? maintenanceTask.maintenanceId;
                    const tag         = assetMap[maintenanceTask.assetId] || `Asset #${maintenanceTask.assetId}`;
                    const statusStyle = STATUS_STYLES[maintenanceTask.status] || {bg:"#f0f0f0",color:"#555",dot:"#888"};
                    return (
                      <tr key={id}>
                        <td><span className="list-tag">🛠 {tag}</span></td>
                        <td><span style={{fontSize:"13px",color:"#4a6650"}}>{maintenanceTask.description || "—"}</span></td>
                        <td>
                          <span className="status-pill" style={{background:statusStyle.bg,color:statusStyle.color,marginTop:0}}>
                            <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:statusStyle.dot,marginRight:5,verticalAlign:"middle"}}/>
                            {(maintenanceTask.status || "—").replace(/_/g," ")}
                          </span>
                        </td>
                        <td>{maintenanceTask.scheduledAt ? new Date(maintenanceTask.scheduledAt).toLocaleString("en-IN") : "—"}</td>
                        <td>{maintenanceTask.nextDueDate ? new Date(maintenanceTask.nextDueDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td style={{color:"#94a3b8",fontSize:12}}>#{id}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
}
