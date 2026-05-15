// pages/staff/operations/ReportCreatePage.jsx
// Redirects to the list — reports are auto-generated from work orders
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportCreatePage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/staff/reports", { replace: true }); }, [navigate]);
  return null;
}
