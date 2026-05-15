// pages/staff/asset/MaintenanceListPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { maintenanceService } from "../../../services/MaintenanceService";
import { assetService }       from "../../../services/Assetservice";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const STATUS_STYLES = {
  Scheduled:   { bg:"#dbeafe", color:"#1b6e3a", dot:"#3fb950" },
  In_Progress: { bg:"#fff3cc", color:"#7d5a00", dot:"#d29922" },
  Completed:   { bg:"#e0f7e4", color:"#1a7f37", dot:"#2da44e" },
  Overdue:     { bg:"#ffe0e0", color:"#7f1d1d", dot:"#dc2626" },
  Cancelled:   { bg:"#f0f0f0", color:"#555",    dot:"#888"    },
  // API may also return PENDING / IN_PROGRESS / COMPLETED
  PENDING:     { bg:"#dbeafe", color:"#1b6e3a", dot:"#3fb950" },
  IN_PROGRESS: { bg:"#fff3cc", color:"#7d5a00", dot:"#d29922" },
  COMPLETED:   { bg:"#e0f7e4", color:"#1a7f37", dot:"#2da44e" },
};

export default function MaintenanceListPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [tasks,     setTasks]     = useState([]);
  const [assetMap,  setAssetMap]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const urlFilter = new URLSearchParams(location.search).get("filter") || "All";
  const [filter, setFilter] = useState(urlFilter);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [mRes, aRes] = await Promise.allSettled([
        maintenanceService.getAll(),
        assetService.getAll(),
      ]);

      if (mRes.status === "fulfilled") {
        const body = mRes.value?.data ?? mRes.value;
        const list = Array.isArray(body)             ? body
          : Array.isArray(body?.data)                ? body.data
          : Array.isArray(body?.data?.data)          ? body.data.data : [];
        setTasks(list);
      } else {
        setError("Failed to load maintenance tasks.");
      }

      if (aRes.status === "fulfilled") {
        const body = aRes.value?.data ?? aRes.value;
        const list = Array.isArray(body)             ? body
          : Array.isArray(body?.data)                ? body.data
          : Array.isArray(body?.data?.data)          ? body.data.data : [];
        const map = {};
        list.forEach(a => { map[a.assetId || a.id] = a.assetTag; });
        setAssetMap(map);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered     = tasks.filter(m => filter === "All" || m.status === filter);
  const overdueCount = tasks.filter(m => m.status === "Overdue" || m.status === "OVERDUE").length;

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
          <div className="header-icon" style={{background:"#fee2e2",color:"#7c2d12"}}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Maintenance Tasks</h1>
            <p className="page-sub">
              {loading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-secondary" onClick={load} disabled={loading}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => navigate("/staff/assets/maintenance")}>+ Schedule Task</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {error}
            <span className="alert-link" onClick={load}>Retry</span>
          </div>
        )}

        {overdueCount > 0 && (
          <div className="alert alert-error">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {overdueCount} task{overdueCount > 1 ? "s are" : " is"} overdue and need immediate attention.
          </div>
        )}

        {loading ? (
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
                {["All","Scheduled","In_Progress","Completed","Overdue","Cancelled"].map(f => {
                  const s = STATUS_STYLES[f];
                  return (
                    <button key={f}
                      className={`filter-btn ${filter===f?"filter-btn--active":""}`}
                      style={filter===f && s ? {background:s.bg,color:s.color,borderColor:s.dot} : {}}
                      onClick={() => setFilter(f)}>
                      {f === "All" ? "All" : f.replace("_"," ")}
                      {f === "Overdue" && overdueCount > 0 && <span className="filter-badge">{overdueCount}</span>}
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
                  ) : filtered.map(m => {
                    const id  = m.id ?? m.taskId ?? m.maintenanceId;
                    const tag = assetMap[m.assetId] || `Asset #${m.assetId}`;
                    const s   = STATUS_STYLES[m.status] || {bg:"#f0f0f0",color:"#555",dot:"#888"};
                    return (
                      <tr key={id}>
                        <td><span className="list-tag">🛠 {tag}</span></td>
                        <td><span style={{fontSize:"13px",color:"#4a6650"}}>{m.description || "—"}</span></td>
                        <td>
                          <span className="status-pill" style={{background:s.bg,color:s.color,marginTop:0}}>
                            <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:s.dot,marginRight:5,verticalAlign:"middle"}}/>
                            {(m.status || "—").replace(/_/g," ")}
                          </span>
                        </td>
                        <td>{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString("en-IN") : "—"}</td>
                        <td>{m.nextDueDate ? new Date(m.nextDueDate).toLocaleDateString("en-IN") : "—"}</td>
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
