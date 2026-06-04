import { useState, useEffect } from "react";
import { StatCard, QuickAction } from "./DashboardShared";
import AddStaffModal from "../../../components/staff/AddStaffModal";
import AdminService  from "../../../services/AdminService";
import { ROLE_BADGE } from "../../../utility/StaffConfig";

function StaffListModal({ onClose }) {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    AdminService.getAllStaff()
      .then(response => {
        const body = response?.data ?? response;
        const list = Array.isArray(body)            ? body
          : Array.isArray(body?.data)               ? body.data
          : Array.isArray(body?.data?.data)         ? body.data.data : [];
        setStaffList(list);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = staffList.filter(staffMember =>
    !search ||
    (staffMember.name  || "").toLowerCase().includes(search.toLowerCase()) ||
    (staffMember.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (staffMember.role  || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
      }}
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px",
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "10px",
              background: "#eff6ff", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px",
            }}>👥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>All Staff Members</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {isLoading ? "Loading…" : `${staffList.length} staff registered`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "#f1f5f9", color: "#64748b", fontSize: "16px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ position: "relative" }}>
            <svg
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
              width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={{
                width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e2e8f0",
                borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box",
              }}
              placeholder="Search by name, email or role…"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
              <div style={{
                width: 28, height: 28, border: "3px solid #e2e8f0",
                borderTopColor: "#3b82f6", borderRadius: "50%",
                animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
              }}/>
              Loading staff…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
              <p>{search ? "No staff match your search." : "No staff registered yet."}</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Name", "Email", "Role", "Phone"].map(header => (
                    <th key={header} style={{
                      padding: "10px 16px", textAlign: "left", fontSize: "11px",
                      fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                      letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9",
                    }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((staffMember, idx) => {
                  const roleBadge = ROLE_BADGE[staffMember.role] || { bg: "#f1f5f9", color: "#475569", label: staffMember.role };
                  const initials  = (staffMember.name || "?").split(" ").map(wordPart => wordPart[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr
                      key={staffMember.staffId ?? idx}
                      style={{ borderBottom: "1px solid #f8fafc" }}
                      onMouseEnter={event => event.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={event => event.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                        #{staffMember.staffId ?? idx + 1}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "#eff6ff", color: "#1e40af",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 700, flexShrink: 0,
                          }}>{initials}</div>
                          <span style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>
                            {staffMember.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>
                        {staffMember.email || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "9999px", fontSize: "11px",
                          fontWeight: 600, background: roleBadge.bg, color: roleBadge.color,
                        }}>{roleBadge.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>
                        {staffMember.phoneNumber || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px", borderTop: "1px solid #f1f5f9",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: "8px", border: "1px solid #e2e8f0",
              background: "#fff", color: "#475569", fontSize: "13px",
              fontWeight: 600, cursor: "pointer",
            }}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdministratorView({ navigate }) {
  const [showAddStaff,  setShowAddStaff]  = useState(false);
  const [showStaffList, setShowStaffList] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [stats, setStats] = useState({
    totalUsers: "…", totalStaff: "…", activeWorkOrders: "…",
  });

  const fetchStats = () => {
    Promise.allSettled([
      AdminService.getAllUsers(),
      AdminService.getAllStaff(),
      AdminService.getAllWorkOrders(),
    ]).then(([users, staff, workOrders]) => {
      const totalUsers       = users.status      === "fulfilled" ? (users.value.data?.data?.length      ?? "—") : "—";
      const totalStaff       = staff.status      === "fulfilled" ? (staff.value.data?.data?.length      ?? "—") : "—";
      const allWO            = workOrders.status === "fulfilled" ? (workOrders.value.data?.data         ?? [])  : [];
      const activeWorkOrders = allWO.filter(workOrder => workOrder.status === "NOT_STARTED" || workOrder.status === "IN_PROGRESS").length;
      setStats({ totalUsers, totalStaff, activeWorkOrders });
    });
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <>
      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onSuccess={(message) => {
            setShowAddStaff(false);
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(""), 4000);
            fetchStats(); // re-fetch so the stat chips update immediately
          }}
        />
      )}

      {showStaffList && <StaffListModal onClose={() => setShowStaffList(false)} />}

      <div className="sh-stats-grid">
        <StatCard icon="👤" label="Total Users"        value={stats.totalUsers}       color="blue"  />
        <StatCard icon="👥" label="Total Staff"        value={stats.totalStaff}       color="green" />
        <StatCard icon="🔧" label="Active Work Orders" value={stats.activeWorkOrders} color="red"   />
      </div>

      {/* ── Staff Management ── */}
      <div className="sh-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h2 className="sh-section-title" style={{ margin: 0 }}>Staff Management</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowStaffList(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0",
                background: "#fff", color: "#1e40af", fontWeight: 600,
                fontSize: "13px", cursor: "pointer",
              }}
            >
              👥 View Staff
            </button>
            <button
              onClick={() => setShowAddStaff(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "8px", border: "none",
                background: "#1e40af", color: "#fff", fontWeight: 600,
                fontSize: "13px", cursor: "pointer",
              }}
            >
              ＋ Add Staff
            </button>
          </div>
        </div>

        {successMessage && (
          <div style={{
            padding: "10px 14px", borderRadius: "8px", marginBottom: "12px",
            background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
            fontSize: "13px", fontWeight: 500,
          }}>
            ✓ {successMessage}
          </div>
        )}
      </div>

      {/* ── Dispatcher Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">🚦 Dispatcher</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📋" label="Service Requests"   onClick={() => navigate("/staff/requests")}           />
          <QuickAction icon="🔧" label="Work Orders"        onClick={() => navigate("/staff/workorders")}          />
          <QuickAction icon="👥" label="Crews"              onClick={() => navigate("/staff/crews")}               />
        </div>
      </div>

      {/* ── Crew Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">👷 Field Crew</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="✅" label="Tasks"              onClick={() => navigate("/staff/tasks")}               />
          <QuickAction icon="🚚" label="Crew Work Orders"   onClick={() => navigate("/staff/crew/workorders")}     />
          <QuickAction icon="📷" label="Evidence Upload"    onClick={() => navigate("/staff/crew/evidence")}       />
        </div>
      </div>

      {/* ── Asset Manager Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">🏗️ Asset Management</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="🏗️" label="Assets"            onClick={() => navigate("/staff/assets")}              />
          <QuickAction icon="📄" label="Asset Registry"    onClick={() => navigate("/staff/assets/registry/list")}/>
          <QuickAction icon="🔍" label="Inspections"       onClick={() => navigate("/staff/inspections")}          />
          <QuickAction icon="🛠️" label="Maintenance"       onClick={() => navigate("/staff/maintenance")}          />
        </div>
      </div>

      {/* ── Operations Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">⚙️ Operations</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="⚙️" label="Operations Overview" onClick={() => navigate("/staff/operations")}                  />
          <QuickAction icon="🔁" label="Priority Work Orders" onClick={() => navigate("/staff/operations/workorders")}       />
          <QuickAction icon="📝" label="Create Work Log"      onClick={() => navigate("/staff/operations/worklogs/create")} />
          <QuickAction icon="📈" label="KPIs"                 onClick={() => navigate("/staff/kpis")}                       />
        </div>
      </div>

      {/* ── Finance Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">💰 Finance</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📒" label="Work Logs"         onClick={() => navigate("/staff/finance/worklogs")} />
          <QuickAction icon="🧰" label="Material Usage"    onClick={() => navigate("/staff/materials")}         />
        </div>
      </div>

      {/* ── Reporting & Compliance Module ── */}
      <div className="sh-section">
        <h2 className="sh-section-title">📑 Reports & Compliance</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📑" label="Reports"       onClick={() => navigate("/staff/reports")}      />
          <QuickAction icon="➕" label="New Report"    onClick={() => navigate("/staff/reports/new")}  />
          <QuickAction icon="🗂️" label="Audit Logs"   onClick={() => navigate("/staff/audit")}        />
        </div>
      </div>
    </>
  );
}
