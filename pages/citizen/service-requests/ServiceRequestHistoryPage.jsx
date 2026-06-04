// pages/citizen/service-requests/ServiceRequestHistoryPage.jsx
import { useState, useEffect }  from "react";
import { useNavigate }           from "react-router-dom";
import { useSelector }           from "react-redux";
import CitizenLayout             from "../../../components/citizen/Layout";
import CitizenService            from "../../../services/CitizenService";
import "../../../styles/TrackRequest.css";
import { ASSET_ICON }            from "../../../utility/AssetIcons";
import { toLabel, formatDate, statusPillClass } from "./ServiceRequestHelpers";

const FINISHED_STATUSES = new Set(["RESOLVED", "CLOSED", "REJECTED"]);

export default function RequestHistory() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((state) => state.auth);

  const rawUserName  = authUser?.email?.split("@")[0] || "User";
  const displayName  = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const user         = { name: displayName, initials: displayName.charAt(0).toUpperCase() };

  const [historyRequests, setHistoryRequests] = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [loadError,       setLoadError]       = useState(null);

  useEffect(() => {
    if (!userId) return;
    CitizenService.getMyRequests(userId)
      .then((response) => {
        const responseData = response.data;
        const requestList  = Array.isArray(responseData) ? responseData : Array.isArray(responseData?.data) ? responseData.data : [];
        setHistoryRequests(
          [...requestList]
            .filter((request) => FINISHED_STATUSES.has(request.status?.toUpperCase()))
            .sort((requestA, requestB) => new Date(requestB.reportedAt) - new Date(requestA.reportedAt))
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Could not load history.";
        setLoadError(String(errorMessage));
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <CitizenLayout user={user}>

      {/* Hero */}
      <div className="tr-hero">
        <div className="tr-hero-inner">
          <div className="tr-crumb">
            <span className="tr-crumb-link" onClick={() => navigate("/citizen/home")}>Home</span>
            &nbsp;›&nbsp; Request History
          </div>
          <div className="tr-hero-badge">🕐 Past Requests</div>
          <h1 className="tr-hero-title">My Request <span>History</span></h1>
          <p className="tr-hero-sub">Browse all your previous service requests and their outcomes.</p>
        </div>
      </div>

      <div className="tr-list-layout">

        {isLoading  && <div className="tr-state-msg">Loading history…</div>}
        {loadError  && <div className="tr-state-msg tr-state-error">{loadError}</div>}

        {!isLoading && !loadError && historyRequests.length === 0 && (
          <div className="tr-empty">
            <div className="tr-empty-icon">📂</div>
            <p>No past requests found.</p>
            <button className="tr-btn tr-btn-green" onClick={() => navigate("/citizen/home")}>
              ← Back to Home
            </button>
          </div>
        )}

        {!isLoading && !loadError && historyRequests.length > 0 && (
          <>
            {historyRequests.map((historyRequest) => {
              const assetIcon = ASSET_ICON[historyRequest.assetType] || "🔧";
              return (
                <div key={historyRequest.requestId} className="tr-req-card" style={{ cursor: "default" }}>
                  <div className="tr-req-card-left">
                    <div className="tr-req-icon">{assetIcon}</div>
                    <div className="tr-req-info">
                      <div className="tr-req-title">
                        {toLabel(historyRequest.assetType)}
                        {historyRequest.assetTag ? <span className="tr-req-tag"> — {historyRequest.assetTag}</span> : ""}
                      </div>
                      <div className="tr-req-id">Request ID: <strong>#{historyRequest.requestId}</strong></div>
                      <div className="tr-req-date">{formatDate(historyRequest.reportedAt)}</div>
                    </div>
                  </div>
                  <div className="tr-req-card-right">
                    <div className={`tr-status-pill ${statusPillClass(historyRequest.status)}`}>
                      <span className="tr-sdot" />
                      {toLabel(historyRequest.status)}
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
