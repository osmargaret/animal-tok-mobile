import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { animalProfiles } from "@/data/animalProfiles";

const ProfileSwitcher = () => {
  const { user, activeProfile, switchProfile, switchToHandler } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !activeProfile) return null;

  const profiles = [
    {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      type: "handler" as const,
      label: "Handler",
    },
    ...animalProfiles.map((a) => ({
      id: a.id,
      name: a.name,
      username: a.username,
      avatar: a.emoji,
      type: "animal" as const,
      label: a.breed,
    })),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
      >
        <span className="text-lg">{activeProfile.avatar}</span>
        <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{activeProfile.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 z-50 w-56 rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Switch Profile</p>
            </div>
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.type === "handler") {
                    switchToHandler();
                  } else {
                    switchProfile({ id: p.id, name: p.name, username: p.username, avatar: p.avatar, type: p.type });
                  }
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors"
              >
                <span className="text-xl">{p.avatar}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.label}</p>
                </div>
                {activeProfile.id === p.id && activeProfile.type === p.type && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSwitcher;
