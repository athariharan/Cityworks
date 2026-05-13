import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReportService from "../../../services/ReportService";
import "../../../styles/ReportViewPage.css";

function ReportViewPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editScope, setEditScope] = useState("");
  const [editParametersJson, setEditParametersJson] = useState("");
  const [editMetricsJson, setEditMetricsJson] = useState("");
  const [editReportUri, setEditReportUri] = useState("");

  const SCOPE_OPTIONS = ["REQUESTS", "WORK_ORDERS", "ASSETS", "MAINTENANCE"];

  // Load report
  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ReportService.getById(reportId);
      setReport(res.data?.data);
      setEditScope(res.data?.data?.scope);
      setEditParametersJson(res.data?.data?.parametersJson || "");
      setEditMetricsJson(res.data?.data?.metricsJson || "");
      setEditReportUri(res.data?.data?.reportUri || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    // Validate JSON
    if (editParametersJson) {
      try {
        JSON.parse(editParametersJson);
      } catch {
        setError("Invalid JSON in Parameters");
        return;
      }
    }

    if (editMetricsJson) {
      try {
        JSON.parse(editMetricsJson);
      } catch {
        setError("Invalid JSON in Metrics");
        return;
      }
    }

    try {
      const payload = {
        scope: editScope,
        parametersJson: editParametersJson || null,
        metricsJson: editMetricsJson || null,
        generatedBy: report.generatedBy,
        reportUri: editReportUri || null,
      };

      const res = await ReportService.update(reportId, payload);
      if (res.data?.success) {
        setReport(res.data?.data);
        setEditMode(false);
      } else {
        setError(res.data?.message || "Failed to update report");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update report");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await ReportService.remove(reportId);
      navigate("/staff/reports");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete report");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  if (loading) return <div className="rview-loading">Loading report...</div>;
  if (error) return <div className="rview-error">{error}</div>;
  if (!report) return <div className="rview-notfound">Report not found</div>;

  return (
    <div className="rview-container">
      <div className="rview-header">
        <button className="rview-btn-back" onClick={() => navigate("/staff/reports")}>
          ← Back to Reports
        </button>
        <h1>Report #{report.reportId}</h1>
        <div className="rview-header-actions">
          {!editMode && (
            <>
              <button className="rview-btn-edit" onClick={() => setEditMode(true)}>
                ✏️ Edit
              </button>
              <button className="rview-btn-delete" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="rview-error">{error}</div>}

      {editMode ? (
        <div className="rview-card">
          <h2>Edit Report</h2>
          <form onSubmit={handleUpdate} className="rview-form">
            <div className="rview-group">
              <label>Report Scope</label>
              <select
                value={editScope}
                onChange={(e) => setEditScope(e.target.value)}
              >
                {SCOPE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="rview-group">
              <label>Parameters (JSON)</label>
              <textarea
                value={editParametersJson}
                onChange={(e) => setEditParametersJson(e.target.value)}
                rows="4"
              />
            </div>

            <div className="rview-group">
              <label>Metrics (JSON)</label>
              <textarea
                value={editMetricsJson}
                onChange={(e) => setEditMetricsJson(e.target.value)}
                rows="4"
              />
            </div>

            <div className="rview-group">
              <label>Report URI</label>
              <input
                type="text"
                value={editReportUri}
                onChange={(e) => setEditReportUri(e.target.value)}
              />
            </div>

            <div className="rview-actions">
              <button
                type="button"
                className="rview-btn-cancel"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              <button type="submit" className="rview-btn-save">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rview-card">
          <div className="rview-field">
            <label>Report ID</label>
            <p>{report.reportId}</p>
          </div>

          <div className="rview-field">
            <label>Scope</label>
            <p><span className="rview-badge">{report.scope}</span></p>
          </div>

          <div className="rview-field">
            <label>Generated By</label>
            <p>User #{report.generatedBy}</p>
          </div>

          <div className="rview-field">
            <label>Generated At</label>
            <p>{formatDate(report.generatedAt)}</p>
          </div>

          {report.parametersJson && (
            <div className="rview-field">
              <label>Parameters</label>
              <pre className="rview-json">{report.parametersJson}</pre>
            </div>
          )}

          {report.metricsJson && (
            <div className="rview-field">
              <label>Metrics</label>
              <pre className="rview-json">{report.metricsJson}</pre>
            </div>
          )}

          {report.reportUri && (
            <div className="rview-field">
              <label>Report URI</label>
              <p>{report.reportUri}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportViewPage;
