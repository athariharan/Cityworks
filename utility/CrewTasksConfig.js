
export const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", dot: "#94a3b8", icon: "🕐" },
  IN_PROGRESS:  { label: "In Progress", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", icon: "⚡" },
  COMPLETED:    { label: "Completed",   bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e", icon: "✅" },
  CANCELLED:    { label: "Cancelled",   bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", dot: "#ef4444", icon: "✕" },
};

export const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f0fdf4", color: "#15803d", bar: "#22c55e" },
  MEDIUM:   { label: "Medium",   bg: "#fefce8", color: "#a16207", bar: "#eab308" },
  HIGH:     { label: "High",     bg: "#fff7ed", color: "#c2410c", bar: "#f97316" },
  CRITICAL: { label: "Critical", bg: "#fef2f2", color: "#991b1b", bar: "#ef4444" },
};

// Format a date value to a readable string
export const fmt = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Count work orders by status key (including ALL)
export const buildCounts = (orders = []) => {
  const counts = { ALL: orders.length };
  orders.forEach(wo => {
    counts[wo.status] = (counts[wo.status] || 0) + 1;
  });
  return counts;
};

// Filter work orders by status and search string
export const filterOrders = (orders = [], status = "ALL", search = "") => {
  return orders.filter(wo => {
    const matchStatus = status === "ALL" || wo.status === status;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(wo.workOrderId).includes(q) ||
      (wo.description || "").toLowerCase().includes(q) ||
      (wo.priority    || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
};
