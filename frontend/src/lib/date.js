/**
 * Safely format a date string from the Django backend.
 * Django returns ISO 8601: "2024-05-01T10:23:45.123456Z"
 * Returns "01 May 2024" format.
 */
export function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    // Replace space with T if Django returns "2024-05-01 10:23:45+00:00"
    const iso = dateStr.toString().replace(" ", "T");
    const d = new Date(iso);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format as "May 2024" (month + year only)
 */
export function fmtMonthYear(dateStr) {
  if (!dateStr) return "—";
  try {
    const iso = dateStr.toString().replace(" ", "T");
    const d = new Date(iso);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
