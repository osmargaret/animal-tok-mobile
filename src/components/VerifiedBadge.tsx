import { BadgeCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  status?: "none" | "pending" | "verified";
  verified?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const VerifiedBadge = ({ status, verified, size = "sm", showLabel = false, className }: VerifiedBadgeProps) => {
  const effective: "none" | "pending" | "verified" = verified ? "verified" : status || "none";
  if (effective === "none") return null;
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  if (effective === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded-full px-1.5 py-0.5",
          className,
        )}
        title="Verification pending"
        aria-label="Verification pending"
      >
        <Clock className={dim} aria-hidden />
        {showLabel && <span>Pending</span>}
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-primary", className)}
      title="Verified"
      aria-label="Verified account"
    >
      <BadgeCheck className={cn(dim, "fill-primary/15")} aria-hidden />
      {showLabel && <span className="text-[10px] font-semibold uppercase tracking-wider">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
