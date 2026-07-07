import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface Highlight {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

interface StoriesRowProps {
  highlights?: Highlight[];
  canAdd?: boolean;
  onAdd?: () => void;
}

const defaultHighlights: Highlight[] = [
  { id: "adventures", label: "Adventures", emoji: "🌲", gradient: "from-emerald-500/30 to-teal-500/20" },
  { id: "besties", label: "Besties", emoji: "💛", gradient: "from-amber-500/30 to-orange-500/20" },
  { id: "training", label: "Training", emoji: "🎾", gradient: "from-sky-500/30 to-blue-500/20" },
  { id: "birthday", label: "Birthday", emoji: "🎂", gradient: "from-pink-500/30 to-rose-500/20" },
];

const StoriesRow = ({ highlights = defaultHighlights, canAdd, onAdd }: StoriesRowProps) => {
  const handleAdd = () => {
    if (onAdd) return onAdd();
    toast("Add a new highlight", { description: "Choose posts to feature on your profile." });
  };

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3" role="list" aria-label="Story highlights">
      {canAdd && (
        <button
          onClick={handleAdd}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          aria-label="Add highlight"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-secondary hover:border-primary/50 hover:bg-primary/5 transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground" aria-hidden />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">New</span>
        </button>
      )}

      {highlights.map((h) => (
        <button
          key={h.id}
          onClick={() => toast(h.label, { description: "Highlight viewer coming soon." })}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          role="listitem"
          aria-label={`View ${h.label} highlight`}
        >
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary via-accent to-primary/60">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${h.gradient} border-2 border-background flex items-center justify-center text-2xl`} aria-hidden>
              {h.emoji}
            </div>
          </div>
          <span className="text-[10px] text-foreground font-medium max-w-[64px] truncate">{h.label}</span>
        </button>
      ))}
    </div>
  );
};

export default StoriesRow;
