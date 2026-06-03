import { useEffect, useRef, useState } from "react";
import { MoreVertical, Flag, ShieldOff, Shield } from "lucide-react";
import { toast } from "sonner";

interface ReportBlockMenuProps {
  targetId: string;
  targetName: string;
}

const STORAGE_BLOCKED = "at_blocked";
const STORAGE_REPORTS = "at_reports";

const readSet = (k: string): Set<string> => {
  try {
    const raw = localStorage.getItem(k);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const writeSet = (k: string, s: Set<string>) => {
  try {
    localStorage.setItem(k, JSON.stringify(Array.from(s)));
  } catch {}
};

const ReportBlockMenu = ({ targetId, targetName }: ReportBlockMenuProps) => {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState<boolean>(() => readSet(STORAGE_BLOCKED).has(targetId));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBlocked(readSet(STORAGE_BLOCKED).has(targetId));
  }, [targetId]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleReport = () => {
    const reason = window.prompt(`Report ${targetName} — briefly tell us what's wrong:`);
    if (!reason) {
      setOpen(false);
      return;
    }
    const reports = readSet(STORAGE_REPORTS);
    reports.add(`${targetId}::${Date.now()}::${reason.slice(0, 80)}`);
    writeSet(STORAGE_REPORTS, reports);
    toast.success("Report submitted", { description: "Our team will review within 24 hours." });
    setOpen(false);
  };

  const handleBlockToggle = () => {
    const set = readSet(STORAGE_BLOCKED);
    if (set.has(targetId)) {
      set.delete(targetId);
      writeSet(STORAGE_BLOCKED, set);
      setBlocked(false);
      toast(`Unblocked ${targetName}`);
    } else {
      set.add(targetId);
      writeSet(STORAGE_BLOCKED, set);
      setBlocked(true);
      toast.success(`Blocked ${targetName}`, { description: "You won't see their content anymore." });
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`More actions for ${targetName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-30 min-w-[180px] rounded-xl border border-border bg-card shadow-lg p-1"
        >
          <button
            role="menuitem"
            onClick={handleReport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
          >
            <Flag className="w-4 h-4 text-muted-foreground" aria-hidden />
            Report
          </button>
          <button
            role="menuitem"
            onClick={handleBlockToggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
          >
            {blocked ? (
              <>
                <Shield className="w-4 h-4 text-primary" aria-hidden /> Unblock
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4 text-destructive" aria-hidden /> Block
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportBlockMenu;
