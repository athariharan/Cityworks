import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import CitizenService from "../../services/CitizenService";
import "../../styles/TrackRequest.css";

const STEPS = [
  { label: "Submitted",   icon: "✓"  },
  { label: "Reviewed",    icon: "✓"  },
  { label: "Scheduled",   icon: "✓"  },
  { label: "In Progress", icon: "🔧" },
  { label: "Closed",      icon: "✅" },
];

const STATUS_STEP = {
  PENDING:     0,
  VALIDATED:   1,
  SCHEDULED:   2,
  IN_PROGRESS: 3,
  RESOLVED:    5,
  CLOSED:      4,
  REJECTED:    0,
};

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



function getStepIndex(status) {
  return STATUS_STEP[status?.toUpperCase()] ?? 0;
}

function toLabel(str) {
  return str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

function formatStepDate(dateStr) {
  if (!dateStr) return null;
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

// ── Single Request Card with stepper ──────────────────────────
function RequestCard({ req }) {
  const stepIndex   = getStepIndex(req.status);
  const displayStep = Math.min(stepIndex, STEPS.length);
  const fillPct     = stepIndex === 0 ? 0 : Math.min(100, Math.round((stepIndex / (STEPS.length - 1)) * 100));
  const icon        = ASSET_ICON[req.assetType] || "🔧";
  const isRejected  = req.status?.toUpperCase() === "REJECTED";

  const stepDates = [
    formatStepDate(req.reportedAt),
    formatStepDate(req.validatedAt),
    formatStepDate(req.scheduledAt),
    null,
    null,
  ];

  return (
    <div className="tr-request-block">
      {/* Banner */}
      <div className="tr-banner">
        <div className="tr-banner-icon">{icon}</div>
        <div className="tr-banner-meta">
          <h2>{toLabel(req.assetType)}{req.assetTag ? ` — ${req.assetTag}` : ""}</h2>
          <div className="tr-banner-id">
            Request ID: <strong>#{req.requestId}</strong>
          </div>
          <div className="tr-banner-tags">
            <span className="tr-tag tr-tag-green">{toLabel(req.assetType)}</span>
            <span className={`tr-tag ${isRejected ? "tr-tag-red" : "tr-tag-violet"}`}>
              {toLabel(req.status)}
            </span>
          </div>
        </div>
        <div className="tr-banner-status">
          <div className={`tr-status-pill ${statusPillClass(req.status)}`}>
            <span className="tr-sdot"></span>
            {toLabel(req.status)}
          </div>
          <div className="tr-banner-date">
            Submitted: {formatDateTime(req.reportedAt)}
          </div>
        </div>
      </div>

      {/* Stepper / Rejected */}
      {isRejected ? (
        <div className="tr-card">
          <div className="tr-ch"><h2>❌ Request Rejected</h2></div>
          <div className="tr-cb">
            <div className="tr-rejected-bar">
              Your request was not approved. Please submit a new request with more details.
            </div>
          </div>
        </div>
      ) : (
        <div className="tr-card">
          <div className="tr-ch">
            <h2>📍 Your Request Progress</h2>
            <span className="tr-tag tr-tag-violet">
              Step {displayStep} of {STEPS.length}
            </span>
          </div>
          <div className="tr-cb">
            <div className="tr-stepper">
              <div className="tr-track">
                <div className="tr-fill" style={{ width: `${fillPct}%` }} />
              </div>
              {STEPS.map((s, i) => {
                const date = i <= stepIndex ? stepDates[i] : null;
                return (
                  <div
                    key={s.label}
                    className={`tr-step ${
                      i < stepIndex ? "done" : i === stepIndex ? "active" : "next"
                    }`}
                  >
                    <div className="tr-sc">{i < stepIndex ? "✓" : s.icon}</div>
                    <div className="tr-sl">{s.label}</div>
                    {date && <div className="tr-step-date">{date}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function TrackRequest() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((s) => s.auth);

  const rawName = authUser?.email?.split("@")[0] || "User";
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const user    = { name, initials: name.charAt(0).toUpperCase() };

  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

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
        // Sort by requestId descending
        setRequests([...list].sort((a, b) => b.requestId - a.requestId));
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Could not load your requests.";
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
            <span className="tr-crumb-link" onClick={() => navigate("/citizen/home")}>Home</span>
            &nbsp;›&nbsp; Track Request
          </div>
          <div className="tr-hero-badge">📍 Live Tracking</div>
          <h1 className="tr-hero-title">Track My <span>Service Requests</span></h1>
          <p className="tr-hero-sub">
            See the real-time status of all your requests — from submission to completion.
          </p>
        </div>
      </div>

      <div className="tr-all-layout">
        {loading && <div className="tr-state-msg">Loading…</div>}
        {error   && <div className="tr-state-msg tr-state-error">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="tr-empty">
            <div className="tr-empty-icon">📭</div>
            <p>You have no service requests yet.</p>
            <button className="tr-btn tr-btn-green" onClick={() => navigate("/citizen/request/new")}>
              + New Request
            </button>
          </div>
        )}

        {!loading && !error && requests.map((req) => (
          <RequestCard key={req.requestId} req={req} />
        ))}

        {!loading && !error && requests.length > 0 && (
          <button
            className="tr-btn tr-btn-green"
            style={{ marginTop: 8, marginBottom: 40 }}
            onClick={() => navigate("/citizen/home")}
          >
            ← Back to Home
          </button>
        )}
      </div>
    </CitizenLayout>
  );
}
