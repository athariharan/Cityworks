// pages/staff/asset/MaintenanceListPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const STATUS_STYLES = {
  Scheduled:   { bg:"#dbeafe", color:"#1b6e3a", dot:"#3fb950" },
  In_Progress: { bg:"#fff3cc", color:"#7d5a00", dot:"#d29922" },
  Completed:   { bg:"#e0f7e4", color:"#1a7f37", dot:"#2da44e" },
  Overdue:     { bg:"#ffe0e0", color:"#7f1d1d", dot:"#dc2626" },
  Cancelled:   { bg:"#f0f0f0", color:"#555",    dot:"#888"    },
};

export default function MaintenanceListPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { maintenance } = useAssets();

  const urlFilter = new URLSearchParams(location.search).get("filter") || "All";
  const [filter, setFilter] = useState(urlFilter);

  const filtered = maintenance.filter(m => filter === "All" || m.status === filter);
  const overdueCount = maintenance.filter(m => m.status === "Overdue").length;

  return (
     <StaffLayout>
    <div className="page-wrapper">
      <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Asset Management
      </button>

      <div className="page-header">
        <div className="header-icon" style={{background:"#fee2e2",color:"#7c2d12"}}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h1 className="page-title">Maintenance Tasks</h1>
          <p className="page-sub">{maintenance.length} task{maintenance.length !== 1 ? "s" : ""} total{overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/staff/assets/maintenance")}>+ Schedule Task</button>
      </div>

      {overdueCount > 0 && (
        <div className="alert alert-error">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          {overdueCount} task{overdueCount > 1 ? "s are" : " is"} overdue and need immediate attention.
        </div>
      )}

      {maintenance.length === 0 ? (
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
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"#64748b"}}>No results</td></tr>
                ) : filtered.map(m => {
                  const s = STATUS_STYLES[m.status] || {bg:"#f0f0f0",color:"#555",dot:"#888"};
                  return (
                    <tr key={m.id}>
                      <td><span className="list-tag">🛠 {m.assetTag}</span></td>
                      <td><span style={{fontSize:"13px",color:"#4a6650"}}>{m.description || "—"}</span></td>
                      <td>
                        <span className="status-pill" style={{background:s.bg,color:s.color,marginTop:0}}>
                          <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:s.dot,marginRight:5,verticalAlign:"middle"}}/>
                          {m.status?.replace("_"," ")}
                        </span>
                      </td>
                      <td>{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString("en-IN") : "—"}</td>
                      <td>{m.nextDueDate ? new Date(m.nextDueDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="list-time">{m.submittedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
 </StaffLayout> );
}