// pages/citizen/service-requests/ServiceRequestTrackingPage.jsx
import { useState, useEffect }  from "react";
import { useNavigate }           from "react-router-dom";
import { useSelector }           from "react-redux";
import CitizenLayout             from "../../../components/citizen/Layout";
import CitizenService            from "../../../services/CitizenService";
import "../../../styles/TrackRequest.css";
import RequestCard               from "./RequestCard";

export default function TrackRequest() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((state) => state.auth);

  const rawUserName  = authUser?.email?.split("@")[0] || "User";
  const displayName  = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const user         = { name: displayName, initials: displayName.charAt(0).toUpperCase() };

  const [serviceRequests, setServiceRequests] = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [loadError,       setLoadError]       = useState(null);

  useEffect(() => {
    if (!userId) return;
    CitizenService.getMyRequests(userId)
      .then((response) => {
        const responseData = response.data;
        const requestList  = Array.isArray(responseData) ? responseData : Array.isArray(responseData?.data) ? responseData.data : [];
        setServiceRequests([...requestList].sort((requestA, requestB) => requestB.requestId - requestA.requestId));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Could not load your requests.";
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
        {isLoading  && <div className="tr-state-msg">Loading…</div>}
        {loadError  && <div className="tr-state-msg tr-state-error">{loadError}</div>}

        {!isLoading && !loadError && serviceRequests.length === 0 && (
          <div className="tr-empty">
            <div className="tr-empty-icon">📭</div>
            <p>You have no service requests yet.</p>
            <button className="tr-btn tr-btn-green" onClick={() => navigate("/citizen/request/new")}>
              + New Request
            </button>
          </div>
        )}

        {!isLoading && !loadError && serviceRequests.map((serviceRequest) => (
          <RequestCard key={serviceRequest.requestId} serviceRequest={serviceRequest} />
        ))}

        {!isLoading && !loadError && serviceRequests.length > 0 && (
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
