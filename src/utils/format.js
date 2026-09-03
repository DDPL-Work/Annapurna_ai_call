export function formatINR(value) {
  if (value == null) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatBudgetRange(min, max) {
  if (min == null && max == null) return "Not captured";
  return `${formatINR(min)} – ${formatINR(max)}`;
}

export function formatRelativeTime(isoString) {
  if (!isoString) return "—";
  const then = new Date(isoString);
  const now = new Date("2026-09-02T10:00:00+05:30");
  const diffMs = then - now;
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const diffDay = Math.round(diffMs / 86400000);

  if (Math.abs(diffMin) < 60) {
    return diffMin === 0 ? "Just now" : diffMin > 0 ? `In ${diffMin}m` : `${Math.abs(diffMin)}m ago`;
  }
  if (Math.abs(diffHr) < 24) {
    return diffHr > 0 ? `In ${diffHr}h` : `${Math.abs(diffHr)}h ago`;
  }
  return diffDay > 0 ? `In ${diffDay}d` : `${Math.abs(diffDay)}d ago`;
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(sec) {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
