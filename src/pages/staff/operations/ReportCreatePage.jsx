import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReportService from "../../../services/ReportService";
import "../../../styles/ReportCreatePage.css";

function ReportCreatePage() {
  const navigate = useNavigate();
  const { userId } = useSelector((state) => state.auth);
  const [scope, setScope] = useState("REQUESTS");
  const [parametersJson, setParametersJson] = useState("");
  const [metricsJson, setMetricsJson] = useState("");
  const [reportUri, setReportUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SCOPE_OPTIONS = ["REQUESTS", "WORK_ORDERS", "ASSETS", "MAINTENANCE"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate JSON fields (optional but helpful)
    if (parametersJson) {
      try {
        JSON.parse(parametersJson);
      } catch {
        setError("Invalid JSON in Parameters");
        setLoading(false);
        return;
      }
    }

    if (metricsJson) {
      try {
        JSON.parse(metricsJson);
      } catch {
        setError("Invalid JSON in Metrics");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        scope,
        parametersJson: parametersJson || null,
        metricsJson: metricsJson || null,
        generatedBy: userId,
        reportUri: reportUri || null,
      };

      const res = await ReportService.create(payload);
      if (res.data?.success) {
        navigate(`/staff/reports/${res.data.data.reportId}`);
      } else {
        setError(res.data?.message || "Failed to create report");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rcreate-container">
      <div className="rcreate-card">
        <h1>Create New Report</h1>

        {error && <div className="rcreate-error">{error}</div>}

        <form onSubmit={handleSubmit} className="rcreate-form">
          <div className="rcreate-group">
            <label htmlFor="scope">Report Scope *</label>
            <select
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              required
            >
              {SCOPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="rcreate-group">
            <label htmlFor="parameters">Parameters (JSON)</label>
            <textarea
              id="parameters"
              value={parametersJson}
              onChange={(e) => setParametersJson(e.target.value)}
              placeholder='{"key": "value"}'
              rows="4"
            />
            <small>Optional. Provide filter/query parameters as JSON.</small>
          </div>

          <div className="rcreate-group">
            <label htmlFor="metrics">Metrics (JSON)</label>
            <textarea
              id="metrics"
              value={metricsJson}
              onChange={(e) => setMetricsJson(e.target.value)}
              placeholder='{"metric": "value"}'
              rows="4"
            />
            <small>Optional. Provide metrics to include in the report as JSON.</small>
          </div>

          <div className="rcreate-group">
            <label htmlFor="reportUri">Report URI</label>
            <input
              type="text"
              id="reportUri"
              value={reportUri}
              onChange={(e) => setReportUri(e.target.value)}
              placeholder="e.g., /path/to/report.pdf"
            />
            <small>Optional. File path or URI where the report is stored.</small>
          </div>

          <div className="rcreate-actions">
            <button
              type="button"
              className="rcreate-btn-cancel"
              onClick={() => navigate("/staff/reports")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rcreate-btn-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportCreatePage;
