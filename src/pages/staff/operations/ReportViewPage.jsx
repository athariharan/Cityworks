// pages/staff/operations/ReportViewPage.jsx
// Redirects to the list — individual work order detail is shown inline via expand
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportViewPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/staff/reports", { replace: true }); }, [navigate]);
  return null;
}
