import { useState, useEffect } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/CrewsPage.css";

const SKILL_ICONS = {
  ELECTRICIAN: "⚡", PLUMBER: "🔧", LANDSCAPER: "🌿",
  SANITATION_WORKER: "🧹", PAVER: "🏗️", FLEET_MECHANIC: "🚗",
  DRIVER: "🚐", CARPENTER: "🪚", MANAGEMENT: "📋",
};

export default function CrewsPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    DispatcherService.getAllFieldWorkers()
      .then(res => setWorkers(res.data?.data || []))
      .catch(() => setError("Failed to load field workers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StaffLayout>
      <div className="cp-root">

        <div className="cp-header">
          <div>
            <h1 className="cp-title">Field Crews</h1>
            <p className="cp-subtitle">All available field workers for work order assignment</p>
          </div>
          {!loading && !error && (
            <span className="cp-count">{workers.length} workers</span>
          )}
        </div>

        {loading ? (
          <div className="cp-empty"><div className="cp-spinner" /><p>Loading field workers…</p></div>
        ) : error ? (
          <div className="cp-empty"><div style={{ fontSize: 40 }}>⚠️</div><p>{error}</p></div>
        ) : workers.length === 0 ? (
          <div className="cp-empty"><div style={{ fontSize: 40 }}>🦺</div><p>No field workers found.</p></div>
        ) : (
          <div className="cp-grid">
            {workers.map(w => (
              <div key={w.fieldWorkerId} className="cp-card">
                <div className="cp-card-icon">{SKILL_ICONS[w.skill] || "👷"}</div>
                <div>
                  <h3 className="cp-card-name">{w.name}</h3>
                  <span className="cp-card-skill">{w.skill?.replace(/_/g, " ") || "—"}</span>
                </div>
                <div className="cp-card-meta">
                  <span className="cp-card-id">Worker #{w.fieldWorkerId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}