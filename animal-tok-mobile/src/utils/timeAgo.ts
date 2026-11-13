/**
 * Robust utility to format relative timestamps into friendly time ago strings:
 * - "Just now" (under 45 seconds or minor clock jitter)
 * - "5m ago", "45m ago"
 * - "2h ago", "18h ago"
 * - "Yesterday" (calendar yesterday or 24-48h ago)
 * - "2d ago", "6d ago"
 * - "2w ago", "3w ago"
 * - "Nov 12", "Oct 25"
 *
 * Resilient against:
 * - Year mismatches (e.g. backend seed 2026 vs real device 2024/2025)
 * - SQL datetime formats ('YYYY-MM-DD HH:mm:ss') on Hermes/Safari engines
 * - Missing or undefined createdAt by extracting embedded Unix timestamps from IDs
 * - Snake_case created_at from Postgres
 * - Preserving already-formatted human strings like 'Yesterday', '2h ago'
 */
export function formatRelativeTime(
  input?: string | number | Date | null,
  fallbackId?: string | number | null
): string {
  let date: Date | null = null;

  // Case 1: Already a valid Date object
  if (input instanceof Date && !isNaN(input.getTime())) {
    date = new Date(input.getTime());
  }
  // Case 2: Numeric timestamp (milliseconds or seconds)
  else if (typeof input === "number" && !isNaN(input) && input > 0) {
    date = new Date(input > 1e11 ? input : input * 1000);
  }
  // Case 3: Valid date string (ISO / UTC timestamp or SQL timestamp)
  else if (typeof input === "string" && input.trim()) {
    let s = input.trim();
    // Numeric timestamp string like "1794565390255"
    if (/^\d{10,13}$/.test(s)) {
      const num = Number(s);
      date = new Date(num > 1e11 ? num : num * 1000);
    } else if (!["just now", ""].includes(s.toLowerCase())) {
      // Normalise SQL 'YYYY-MM-DD HH:mm:ss' to 'YYYY-MM-DDTHH:mm:ss' for Hermes/WebKit engines
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
        s = s.replace(" ", "T");
      }
      // Ensure ISO string without timezone defaults to UTC ('Z')
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
        s += "Z";
      }
      const parsed = Date.parse(s);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      }
    }
  }

  // Case 4: Recover timestamp embedded in ID (e.g. "p_1794565390255" or "post_1794565390255")
  if ((!date || isNaN(date.getTime())) && fallbackId) {
    const match = String(fallbackId).match(/\d{10,13}/);
    if (match) {
      const num = Number(match[0]);
      date = new Date(num > 1e11 ? num : num * 1000);
    }
  }

  // Fallback: If input was already a human-formatted string like "2h ago" or "Yesterday", preserve it
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

  // Year mismatch protection (e.g. backend seed has 2026 while user device is in 2024/2025)
  if (date.getFullYear() > now.getFullYear()) {
    date.setFullYear(now.getFullYear());
  }

  let diffMs = now.getTime() - date.getTime();

  // If timestamp is slightly in the future (within 2 mins) due to clock skew, treat as just now
  if (diffMs < 0 && diffMs >= -120 * 1000) {
    return "Just now";
  }
  // If timestamp is further in the future (timezone offset mismatch), use absolute difference
  if (diffMs < -120 * 1000) {
    diffMs = Math.abs(diffMs);
  }

  // Immediate timestamp
  if (diffMs < 45 * 1000) {
    return "Just now";
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const postTime = date.getTime();

  // If posted within the last 60 minutes
  if (diffMins < 60) {
    return `${Math.max(1, diffMins)}m ago`;
  }

  // If posted today:
  if (diffHours < 24) {
    if (postTime < todayStart && postTime >= yesterdayStart) {
      return "Yesterday";
    }
    return `${diffHours}h ago`;
  }

  // If posted yesterday:
  if ((postTime >= yesterdayStart && postTime < todayStart) || diffHours < 48) {
    return "Yesterday";
  }

  // If posted 2 to 7 days ago:
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 7) {
    return `${Math.max(2, diffDays)}d ago`;
  }

  // If posted 1 to 4 weeks ago:
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks <= 4) {
    return `${Math.max(1, diffWeeks)}w ago`;
  }

  // Beyond a month: format as "Nov 12"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
