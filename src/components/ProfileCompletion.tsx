import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileCompletionProps {
  onEdit?: () => void;
  compact?: boolean;
}

const ProfileCompletion = ({ onEdit, compact }: ProfileCompletionProps) => {
  const { completionPercent, completionChecklist, verificationStatus, requestVerification, verified } = useAuth();

  if (completionPercent >= 100 && verified) return null;

  const handleVerify = () => {
    if (completionPercent < 80) {
      toast.error("Complete at least 80% of your profile to request verification.");
      return;
    }
    requestVerification();
    toast.success("Verification requested", { description: "Our team will review within 24 hours." });
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold">Profile {completionPercent}% complete</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
          >
            Edit
          </button>
        )}
      </div>
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mb-3" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
      </div>
      {!compact && (
        <ul className="space-y-1 mb-3">
          {completionChecklist.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  item.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
                aria-hidden
              >
                {item.done && <Check className="w-3 h-3" />}
              </span>
              <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!verified && (
        <button
          onClick={handleVerify}
          disabled={verificationStatus === "pending"}
          className="w-full text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {verificationStatus === "pending" ? "Verification pending review" : "Request verification badge"}
        </button>
      )}
    </div>
  );
};

export default ProfileCompletion;
