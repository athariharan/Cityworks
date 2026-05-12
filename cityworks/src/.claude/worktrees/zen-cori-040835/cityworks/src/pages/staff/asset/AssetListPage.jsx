// pages/staff/asset/AssetListPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";
const STATUS_COLORS = {
  Active:             { bg:"#dbeafe", color:"#1e40af" },
  Inactive:           { bg:"#f0f0f0", color:"#555" },
  Under_Maintenance:  { bg:"#fff3cc", color:"#7d5a00" },
  Decommissioned:     { bg:"#ffe0e0", color:"#7f1d1d" },
};

const TYPE_ICONS = { Road:"🛣", Light:"💡", Park:"🌳", Utility:"⚡" };

export default function AssetListPage() {
  const navigate = useNavigate();
  const { assets } = useAssets();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");

  const filtered = assets
    .filter(a => filter === "All" || a.type === filter)
    .filter(a => !search || a.assetTag.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase()));

  return (
     <StaffLayout>
    <div className="page-wrapper">
      <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Asset Management
      </button>

      <div className="page-header">
        <div className="header-icon"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg></div>
        <div>
          <h1 className="page-title">All Assets</h1>
          <p className="page-sub">{assets.length} asset{assets.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>+ Add Asset</button>
      </div>

      {assets.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">🏗</div>
          <h3>No assets registered yet</h3>
          <p>Start by registering your first municipal asset.</p>
          <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>+ Register Asset</button>
        </div>
      ) : (
        <>
          <div className="list-toolbar">
            <input className="input list-search" placeholder="Search by tag or type..." value={search} onChange={e => setSearch(e.target.value)}/>
            <div className="list-filters">
              {["All","Road","Light","Park","Utility"].map(f => (
                <button key={f} className={`filter-btn ${filter===f?"filter-btn--active":""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Install Date</th>
                  <th>Document</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"#64748b"}}>No results found</td></tr>
                ) : filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || { bg:"#f0f0f0", color:"#555" };
                  return (
                    <tr key={a.id}>
                      <td><span className="list-tag">{TYPE_ICONS[a.type] || "📦"} {a.assetTag}</span></td>
                      <td>{a.type}</td>
                      <td><span className="status-pill" style={{background:sc.bg,color:sc.color,marginTop:0}}>{a.status?.replace("_"," ")}</span></td>
                      <td>{a.installDate}</td>
                      <td><span className="list-doctype">{a.docType?.replace("_"," ") || "—"}</span></td>
                      <td className="list-time">{a.submittedAt}</td>
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