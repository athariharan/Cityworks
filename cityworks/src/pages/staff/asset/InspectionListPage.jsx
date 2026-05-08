// pages/staff/asset/InspectionListPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";
const COND_COLORS = {
  EXCELLENT: { bg:"#dbeafe", color:"#1a7f37", dot:"#2da44e" },
  GOOD:      { bg:"#c8f0d8", color:"#1b6e3a", dot:"#3fb950" },
  FAIR:      { bg:"#fff3cc", color:"#7d5a00", dot:"#d29922" },
  POOR:      { bg:"#ffe4d0", color:"#9a3412", dot:"#e25c2c" },
  CRITICAL:  { bg:"#ffe0e0", color:"#7f1d1d", dot:"#dc2626" },
};

export default function InspectionListPage() {
  const navigate = useNavigate();
  const { inspections } = useAssets();
  const [filter, setFilter] = useState("All");

  const filtered = inspections.filter(i => filter === "All" || i.conditionRating === filter);

  return (
    <StaffLayout>
    <div className="page-wrapper">
      <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Asset Management
      </button>

      <div className="page-header">
        <div className="header-icon" style={{background:"#dbeafe",color:"#1a4971"}}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div>
          <h1 className="page-title">Inspection Records</h1>
          <p className="page-sub">{inspections.length} record{inspections.length !== 1 ? "s" : ""} logged</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/staff/assets/inspections")}>+ New Inspection</button>
      </div>

      {inspections.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">🔍</div>
          <h3>No inspections logged yet</h3>
          <p>Start by recording your first asset inspection.</p>
          <button className="btn-primary" onClick={() => navigate("/staff/assets/inspections")}>+ New Inspection</button>
        </div>
      ) : (
        <>
          <div className="list-toolbar">
            <div className="list-filters">
              {["All","EXCELLENT","GOOD","FAIR","POOR","CRITICAL"].map(f => {
                const c = COND_COLORS[f];
                return (
                  <button key={f}
                    className={`filter-btn ${filter===f?"filter-btn--active":""}`}
                    style={filter===f && c ? {background:c.bg,color:c.color,borderColor:c.dot} : {}}
                    onClick={() => setFilter(f)}>
                    {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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
                  <th>Inspector</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Performed At</th>
                  <th>Logged</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"#64748b"}}>No results</td></tr>
                ) : filtered.map(i => {
                  const cc = COND_COLORS[i.conditionRating] || {bg:"#f0f0f0",color:"#555",dot:"#888"};
                  return (
                    <tr key={i.id}>
                      <td><span className="list-tag">🔍 {i.assetTag}</span></td>
                      <td>{i.inspectorName}</td>
                      <td>
                        <span className="status-pill" style={{background:cc.bg,color:cc.color,marginTop:0}}>
                          <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:cc.dot,marginRight:5,verticalAlign:"middle"}}/>
                          {i.conditionRating}
                        </span>
                      </td>
                      <td>{i.status?.replace("_"," ")}</td>
                      <td>{i.performedAt ? new Date(i.performedAt).toLocaleString("en-IN") : "—"}</td>
                      <td className="list-time">{i.submittedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  </StaffLayout>);
}