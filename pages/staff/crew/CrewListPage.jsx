import { useState, useEffect } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/CrewsPage.css";
import { SKILL_ICONS } from "../../../utility/CrewConfig";

export default function CrewsPage() {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    DispatcherService.getAllFieldWorkers()
      .then(response => setWorkers(response.data?.data || []))
      .catch(() => setError("Failed to load field workers."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <StaffLayout>
      <div className="cp-root">

        <div className="cp-header">
          <div>
            <h1 className="cp-title">Field Crews</h1>
            <p className="cp-subtitle">All available field workers for work order assignment</p>
          </div>
          {!isLoading && !error && (
            <span className="cp-count">{workers.length} workers</span>
          )}
        </div>

        {isLoading ? (
          <div className="cp-empty"><div className="cp-spinner" /><p>Loading field workers…</p></div>
        ) : error ? (
          <div className="cp-empty"><div style={{ fontSize: 40 }}>⚠️</div><p>{error}</p></div>
        ) : workers.length === 0 ? (
          <div className="cp-empty"><div style={{ fontSize: 40 }}>🦺</div><p>No field workers found.</p></div>
        ) : (
          <div className="cp-grid">
            {workers.map(worker => (
              <div key={worker.fieldWorkerId} className="cp-card">
                <div className="cp-card-icon">{SKILL_ICONS[worker.skill] || "👷"}</div>
                <div>
                  <h3 className="cp-card-name">{worker.name}</h3>
                  <span className="cp-card-skill">{worker.skill?.replace(/_/g, " ") || "—"}</span>
                </div>
                <div className="cp-card-meta">
                  <span className="cp-card-id">Worker #{worker.fieldWorkerId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
