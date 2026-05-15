export type CtaKind = "web" | "tel" | "sms" | "mail";

export interface CtaInfo {
  kind: CtaKind;
  href: string;
  display: string;
  valid: boolean;
}

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const validateCtaUrl = (raw: string): CtaInfo => {
  const t = raw.trim();
  if (!t) return { kind: "web", href: "", display: "", valid: false };

  // Phone number: + or digits with separators
  const phoneMatch = /^(?:tel:)?(\+?[\d][\d\s\-().]{5,}\d)$/.exec(t);
  if (phoneMatch) {
    const num = phoneMatch[1].replace(/[\s\-().]/g, "");
    return { kind: "tel", href: `tel:${num}`, display: num, valid: true };
  }
  if (t.startsWith("sms:")) {
    return { kind: "sms", href: t, display: t.replace(/^sms:/, ""), valid: true };
  }
  if (t.startsWith("mailto:") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    const href = t.startsWith("mailto:") ? t : `mailto:${t}`;
    return { kind: "mail", href, display: href.replace(/^mailto:/, ""), valid: true };
  }
  // Web URL
  let candidate = t;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (!u.hostname.includes(".")) throw new Error("invalid");
    return { kind: "web", href: u.toString(), display: u.hostname, valid: true };
  } catch {
    return { kind: "web", href: "", display: "", valid: false };
  }
};

export const openCta = (info: CtaInfo) => {
  if (!info.valid) return;
  if (info.kind === "tel" || info.kind === "sms" || info.kind === "mail") {
    // Native handlers — same window so OS takes over (especially on mobile)
    window.location.href = info.href;
    return;
  }
  // Web links: new tab on desktop, same tab on mobile to avoid popup blockers
  if (isMobile()) {
    window.location.href = info.href;
  } else {
    window.open(info.href, "_blank", "noopener,noreferrer");
  }
};

export const ctaActionLabel = (info: CtaInfo, fallback = "Learn more") => {
  if (!info.valid) return fallback;
  if (info.kind === "tel") return "Call now";
  if (info.kind === "sms") return "Text us";
  if (info.kind === "mail") return "Email us";
  return fallback;
};
