// pages/staff/audit/AuditDetailModal.jsx
import { useState } from "react";
import {
  ActionBadge,
  ModuleBadge,
  RoleBadge,
  formatFullDate,
  formatTime,
} from "./AuditHelpers";

export default function DetailModal({ log, onClose }) {
  const [techOpen, setTechOpen] = useState(false);

  return (
    <div className="al-backdrop" onClick={onClose}>
      <div className="al-modal" onClick={event => event.stopPropagation()}>

        <div className="al-modal-top">
          <div className="al-modal-badges">
            <ActionBadge action={log.action} />
            <ModuleBadge module={log.module} />
          </div>
          <button className="al-modal-x" onClick={onClose}>✕</button>
        </div>

        <h2 className="al-modal-title">{log.activity || "Action performed"}</h2>

        <div className="al-modal-body">

          {/* WHO */}
          <div className="al-section">
            <p className="al-section-label">WHO PERFORMED THIS</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Email</span>
                <span className="al-fval">{log.email || "—"}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Role</span>
                <span className="al-fval"><RoleBadge role={log.role} /></span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Account Type</span>
                <span className="al-fval">{log.staffType || "—"}</span>
              </div>
            </div>
          </div>

          {/* WHEN */}
          <div className="al-section">
            <p className="al-section-label">WHEN IT HAPPENED</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Date</span>
                <span className="al-fval">{formatFullDate(log.performedAt)}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Time</span>
                <span className="al-fval">{formatTime(log.performedAt)}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Log ID</span>
                <span className="al-fval al-logid">#{log.auditId}</span>
              </div>
            </div>
          </div>

          {/* WHAT */}
          <div className="al-section">
            <p className="al-section-label">WHAT WAS AFFECTED</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Module</span>
                <span className="al-fval"><ModuleBadge module={log.module} /></span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Action Type</span>
                <span className="al-fval"><ActionBadge action={log.action} /></span>
              </div>
              {log.recordRef && (
                <div className="al-field">
                  <span className="al-fkey">Affected Record</span>
                  <span className="al-fval al-logid">#{log.recordRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="al-section">
            <p className="al-section-label">FULL DESCRIPTION</p>
            <p className="al-desc-text">{log.description || "No description available."}</p>
          </div>

          {/* TECHNICAL (collapsible) */}
          <div className="al-tech-wrap">
            <button className="al-tech-toggle" onClick={() => setTechOpen(previousOpen => !previousOpen)}>
              <span>{techOpen ? "▼" : "▶"}</span> Technical Info
            </button>
            {techOpen && (
              <div className="al-tech-body">
                <div className="al-field">
                  <span className="al-fkey">Entity Class</span>
                  <span className="al-fval al-mono">{log.entityName || "—"}</span>
                </div>
                <div className="al-field">
                  <span className="al-fkey">Method</span>
                  <span className="al-fval al-mono">{log.methodName || "—"}</span>
                </div>
                <div className="al-field">
                  <span className="al-fkey">Raw Details</span>
                  <span className="al-fval al-mono al-raw">{log.rawDetails || "—"}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
