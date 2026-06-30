import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAnimalMeta, type AnimalVerificationStatus } from "@/hooks/useAnimalMeta";

interface Props {
  animalId: string;
  animalName: string;
  compact?: boolean;
}

const AnimalProfileCompletion = ({ animalId, animalName, compact }: Props) => {
  const { meta, checklist, completionPercent, verified, verificationStatus, update, requestVerification } =
    useAnimalMeta(animalId);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(meta.bio || "");

  if (completionPercent >= 100 && verified) return null;

  const handleVerify = () => {
    if (completionPercent < 80) {
      toast.error("Complete at least 80% of the pet profile to request verification.");
      return;
    }
    requestVerification();
    toast.success("Verification requested", { description: "Our team will review within 24 hours." });
  };

  const saveBio = () => {
    update({ bio });
    setEditing(false);
    toast.success("Bio updated");
  };

  const status: AnimalVerificationStatus = verificationStatus;

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold">{animalName}'s profile {completionPercent}% complete</p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>
      <div
        className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={completionPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
      </div>

      {!compact && (
        <ul className="space-y-1 mb-3">
          {checklist.map((item) => (
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

      {editing && (
        <div className="space-y-2 mb-3">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Tell others about this pet..."
            className="w-full text-xs rounded-lg border border-border bg-background p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Pet bio"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => update({ vaccinated: !meta.vaccinated })}
              className={`text-[11px] px-2 py-1 rounded-full border ${
                meta.vaccinated ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"
              }`}
            >
              {meta.vaccinated ? "✓ Vaccinated" : "Mark vaccinated"}
            </button>
            <button
              onClick={() => update({ microchipped: !meta.microchipped })}
              className={`text-[11px] px-2 py-1 rounded-full border ${
                meta.microchipped ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"
              }`}
            >
              {meta.microchipped ? "✓ Microchipped" : "Mark microchipped"}
            </button>
          </div>
          <button
            onClick={saveBio}
            className="w-full text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save bio
          </button>
        </div>
      )}

      {!verified && (
        <button
          onClick={handleVerify}
          disabled={status === "pending"}
          className="w-full text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {status === "pending" ? "Verification pending review" : "Request verification badge"}
        </button>
      )}
    </div>
  );
};

export default AnimalProfileCompletion;
