/**
 * Robust utility to format relative timestamps into friendly time ago strings:
 * - "Just now" (under 45 seconds)
 * - "5m ago", "45m ago"
 * - "2h ago", "18h ago"
 * - "Yesterday" (calendar day before today)
 * - "2d ago", "6d ago"
 * - "2w ago", "3w ago"
 * - "Nov 12", "Oct 25"
 */
export function formatRelativeTime(
  input?: string | number | Date | null,
  fallbackId?: string | number | null
): string {
  let date: Date | null = null;

  // Case 1: Already a valid Date object
  if (input instanceof Date && !isNaN(input.getTime())) {
    date = input;
  }
  // Case 2: Numeric timestamp (milliseconds or seconds)
  else if (typeof input === "number" && !isNaN(input) && input > 0) {
    date = new Date(input > 1e11 ? input : input * 1000);
  }
  // Case 3: Valid date string (ISO / UTC timestamp)
  else if (typeof input === "string" && input.trim()) {
    const trimmed = input.trim();
    // Numeric timestamp string like "1794565390255"
    if (/^\d{10,13}$/.test(trimmed)) {
      const num = Number(trimmed);
      date = new Date(num > 1e11 ? num : num * 1000);
    } else if (!["just now", ""].includes(trimmed.toLowerCase())) {
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      }
    }
  }

  // Case 4: If date still not resolved, parse timestamp embedded in ID (e.g. "p_1794565390255" or "post_1794565390255")
  if (!date && fallbackId) {
    const match = String(fallbackId).match(/\d{10,13}/);
    if (match) {
      const num = Number(match[0]);
      date = new Date(num > 1e11 ? num : num * 1000);
    }
  }

  // Fallback: If input was already a formatted string like "2h ago", keep it unless it's generic "just now"
  if (!date || isNaN(date.getTime())) {
    if (
      typeof input === "string" &&
      input.trim() &&
      !["just now", ""].includes(input.trim().toLowerCase())
    ) {
      return input.trim();
    }
    return "Just now";
  }

  const now = new Date();
  const postTime = date.getTime();
  const diffMs = now.getTime() - postTime;

  // Immediate or future timestamp
  if (diffMs < 45 * 1000) {
    return "Just now";
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  // Calendar boundaries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  // If posted today:
  if (postTime >= todayStart) {
    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}m ago`;
    }
    return `${diffHours}h ago`;
  }

  // If posted yesterday:
  if (postTime >= yesterdayStart && postTime < todayStart) {
    return "Yesterday";
  }

  // If posted 2 to 7 days ago:
  const diffDays = Math.floor((todayStart - postTime) / (24 * 60 * 60 * 1000)) + 1;
  if (diffDays <= 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks <= 4) {
    return `${diffWeeks}w ago`;
  }

  // Beyond a month: format as "Nov 12"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
