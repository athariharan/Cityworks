import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import CitizenService from "../../services/CitizenService";
import "../../styles/TrackRequest.css";

const ASSET_ICON = {
  ROAD: "🛣️", BRIDGE: "🌉", FOOTPATH: "🚶", SPEED_BREAKER: "⛔",
  BUS_STOP: "🚌", PARKING_LOTS: "🅿️",
  STREET_LAMP: "💡", TRAFFIC_SIGNAL: "🚦", PEDESTRIAN_LIGHT: "🔦",
  WATER_TAP: "🚰", WATER_PIPELINE: "🔧", WATER_TANK: "🫙",
  SEWAGE: "🪣", DRAINAGE: "💧", MANHOLE: "⭕", STORM_DRAIN: "🌊",
  PUBLIC_TOILET: "🚻",
  TRANSFORMER: "⚡", ELECTRIC_POLE: "🔌", SUBSTATION: "🏭",
  PARK: "🌳", PLAYGROUND: "🎡", GARDEN: "🌺", MARKET: "🏪",
  GARBAGE_BIN: "🗑️", WASTE_COLLECTION_POINT: "♻️",
  HEALTH_CENTER: "🏥", SCHOOL_BUILDING: "🏫",
  ROAD_SIGN: "🪧", CCTV_CAMERA: "📷",
};

function toLabel(str) {
  return str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function statusPillClass(status) {
  switch (status?.toUpperCase()) {
    case "PENDING":  return "tr-sp-amber";
    case "REJECTED": return "tr-sp-red";
    case "CLOSED":
    case "RESOLVED": return "tr-sp-green";
    default:         return "tr-sp-blue";
  }
}

export default function RequestHistory() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((s) => s.auth);

  const rawName = authUser?.email?.split("@")[0] || "User";
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const user    = { name, initials: name.charAt(0).toUpperCase() };

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!userId) return;
    CitizenService.getMyRequests(userId)
      .then((res) => {
        const payload = res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        // Sort newest first, skip the first (that's the current request)
        const FINISHED = new Set(["RESOLVED", "CLOSED", "REJECTED"]);
        // Only show finished requests, newest first
        const finished = [...list]
          .filter((r) => FINISHED.has(r.status?.toUpperCase()))
          .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
        setHistory(finished);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Could not load history.";
        setError(String(msg));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <CitizenLayout user={user}>
      {/* Hero */}
      <div className="tr-hero">
        <div className="tr-hero-inner">
          <div className="tr-crumb">
            <span className="tr-crumb-link" onClick={() => navigate("/citizen/home")}>
              Home
            </span>
            &nbsp;›&nbsp; Request History
          </div>
          <div className="tr-hero-badge">🕐 Past Requests</div>
          <h1 className="tr-hero-title">My Request <span>History</span></h1>
          <p className="tr-hero-sub">
            Browse all your previous service requests and their outcomes.
          </p>
        </div>
      </div>

      <div className="tr-list-layout">

        {loading && <div className="tr-state-msg">Loading history…</div>}

        {error && <div className="tr-state-msg tr-state-error">{error}</div>}

        {!loading && !error && history.length === 0 && (
          <div className="tr-empty">
            <div className="tr-empty-icon">📂</div>
            <p>No past requests found.</p>
            <button className="tr-btn tr-btn-green" onClick={() => navigate("/citizen/home")}>
              ← Back to Home
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <>
            {history.map((req) => {
              const icon = ASSET_ICON[req.assetType] || "🔧";
              return (
                <div key={req.requestId} className="tr-req-card" style={{ cursor: "default" }}>
                  <div className="tr-req-card-left">
                    <div className="tr-req-icon">{icon}</div>
                    <div className="tr-req-info">
                      <div className="tr-req-title">
                        {toLabel(req.assetType)}
                        {req.assetTag ? <span className="tr-req-tag"> — {req.assetTag}</span> : ""}
                      </div>
                      <div className="tr-req-id">
                        Request ID: <strong>#{req.requestId}</strong>
                      </div>
                      <div className="tr-req-date">{formatDate(req.reportedAt)}</div>
                    </div>
                  </div>
                  <div className="tr-req-card-right">
                    <div className={`tr-status-pill ${statusPillClass(req.status)}`}>
                      <span className="tr-sdot"></span>
                      {toLabel(req.status)}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              className="tr-btn tr-btn-green"
              style={{ marginTop: 8 }}
              onClick={() => navigate("/citizen/home")}
            >
              ← Back to Home
            </button>
          </>
        )}

      </div>
    </CitizenLayout>
  );
}
