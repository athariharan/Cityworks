import { useState, useEffect, useCallback } from "react";
import StaffLayout              from "../../../components/staff/StaffLayout";
import MaterialUsageService     from "../../../services/MaterialUsageService";
import WorkLogService           from "../../../services/WorkLogService";
import "../../../styles/MaterialUsagePage.css";
import UsageModal               from "./MaterialUsageModal";
import { formatRupees }   from "../../../utility/WorkLogHelpers";
import { unwrap }               from "../../../utility/ApiHelpers";
import { useToast }             from "../../../utility/useToast";

function StatChip({ icon, label, value, color }) {
  return (
    <div className="mu-stat" style={{ "--mc": color }}>
      <div className="mu-stat-icon">{icon}</div>
      <div className="mu-stat-body">
        <div className="mu-stat-value">{value}</div>
        <div className="mu-stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function MaterialUsagePage() {
  const [materialUsageRecords, setMaterialUsageRecords] = useState([]);   // all material usage records
  const [workLogs,             setWorkLogs]             = useState([]);   // all work logs
  const [isLoading,            setIsLoading]            = useState(false);
  const [isSaving,             setIsSaving]             = useState(false);
  const [deletingRecordId,     setDeletingRecordId]     = useState(null);
  const [activeModal,          setActiveModal]          = useState(null); 
  const [searchQuery,          setSearchQuery]          = useState("");
  const [activeToast, displayToast] = useToast();

  // Fetches both material usage records and work logs in parallel
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      //renders even if one component fails
      const [materialUsageResult, workLogResult] = await Promise.allSettled([
        MaterialUsageService.getAll(),
        WorkLogService.getAll(),
      ]);
      setMaterialUsageRecords(materialUsageResult.status === "fulfilled" ? unwrap(materialUsageResult.value) : []);
      setWorkLogs(workLogResult.status === "fulfilled" ? unwrap(workLogResult.value) : []);
    } catch {
      displayToast("Failed to load data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const totalRecords  = materialUsageRecords.length;
  const totalSpend    = materialUsageRecords.reduce((runningTotal, record) => runningTotal + (Number(record.totalCost) || 0), 0);
  const averageCost   = totalRecords > 0 ? (totalSpend / totalRecords) : 0;

  const filteredRecords = materialUsageRecords.filter(record => {
    const searchTerm = searchQuery.trim();
    return !searchTerm || String(record.workOrderId).includes(searchTerm);
  });

  // Create or update logic — determined by whether activeModal already has a usageId
  const handleSave = async (payload) => {
    setIsSaving(true);
    try {
      if (activeModal?.usageId) {
        await MaterialUsageService.update(activeModal.usageId, payload);
        displayToast("Record updated successfully.");
      } else {
        await MaterialUsageService.create(payload);
        displayToast("Record created successfully.");
      }
      setActiveModal(null);
      fetchAllData(); // refresh table
    } catch (error) {
      displayToast(error.response?.data?.message || "Save failed. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Delete this material usage record?")) return; // stops if cancel is pressed
    setDeletingRecordId(recordId);
    try {
      await MaterialUsageService.remove(recordId);
      setMaterialUsageRecords(previousRecords => previousRecords.filter(record => record.usageId !== recordId));
      displayToast("Record deleted.");
    } catch {
      displayToast("Delete failed.", "error");
    } finally {
      setDeletingRecordId(null);
    }
  };

  return (
    <StaffLayout>
      <div className="mu-root">

        <div className="mu-hero">
          <div className="mu-hero-blob mu-hero-blob--1" />
          <div className="mu-hero-blob mu-hero-blob--2" />
          <div className="mu-hero-content">
            <div>
              <div className="mu-hero-breadcrumb">Dashboard · Finance</div>
              <h1 className="mu-hero-title">Material Usage</h1>
              <p className="mu-hero-sub">Track materials consumed across work orders and work logs</p>
            </div>
            <button className="mu-hero-btn" onClick={() => setActiveModal("create")}>
              New Record
            </button>
          </div>
        </div>

        {activeToast && (
          <div className={`mu-toast mu-toast--${activeToast.toastType}`}>
            {activeToast.message}
          </div>
        )}

        <div className="mu-stats-row">
          <StatChip icon="📦" label="Total Records"     value={totalRecords}           color="#4f46e5" />
          <StatChip icon="💰" label="Total Spend"       value={formatRupees(totalSpend)}      color="#0d9488" />
          <StatChip icon="📊" label="Avg Cost / Record" value={formatRupees(averageCost)}     color="#d97706" />
        </div>

        <div className="mu-toolbar">
          <div className="mu-search-wrap">
            <input
              className="mu-search-input"
              placeholder="Search by Work Order ID…"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button className="mu-search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
          <button className="mu-btn-refresh" onClick={fetchAllData} disabled={isLoading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        <div className="mu-card">
          {isLoading ? (
            <div className="mu-empty">
              <div className="mu-spinner-lg" />
              <p>Loading records…</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="mu-empty">
              <div className="mu-empty-icon">📦</div>
              <p className="mu-empty-text">
                {searchQuery ? "No records match your search." : "No material usage records yet."}
              </p>
              {!searchQuery && (
                <button className="mu-btn-primary" onClick={() => setActiveModal("create")}>
                  + Create First Record
                </button>
              )}
            </div>
          ) : (
            <div className="mu-table-wrap">
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>#</th><th>Log ID</th><th>Work Order</th><th>Material</th>
                    <th>Qty</th><th>Unit Cost</th><th>Total Cost</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.usageId} className="mu-row">
                      <td className="mu-td-id">#{record.usageId}</td>
                      <td><span className="mu-log-badge">Log #{record.logId}</span></td>
                      <td><span className="mu-wo-badge">WO #{record.workOrderId}</span></td>
                      <td className="mu-td-plain">{record.materialName || "—"}</td>
                      <td><span className="mu-qty-badge">{record.quantity}</span></td>
                      <td className="mu-td-cost">{formatRupees(record.unitCost)}</td>
                      <td className="mu-td-total">{formatRupees(record.totalCost)}</td>
                      <td className="mu-td-actions">
                        <button className="mu-btn-edit" title="Edit" onClick={() => setActiveModal(record)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button className="mu-btn-delete" title="Delete"
                          disabled={deletingRecordId === record.usageId}
                          onClick={() => handleDelete(record.usageId)}>
                          {deletingRecordId === record.usageId
                            ? <span className="mu-spinner" />
                            : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                          }
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {activeModal && (
        <UsageModal
          initial={activeModal === "create" ? null : activeModal}
          workLogs={workLogs}
          onSave={handleSave}
          onClose={() => setActiveModal(null)}
          isSaving={isSaving}
        />
      )}
    </StaffLayout>
  );
}
