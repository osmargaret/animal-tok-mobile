import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, LogOut, Settings } from "lucide-react";
import { useAuth, type ActiveProfile } from "@/contexts/AuthContext";
import { animalProfiles } from "@/data/animalProfiles";
import { toast } from "sonner";

interface ProfileSwitcherModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileSwitcherModal = ({ open, onClose }: ProfileSwitcherModalProps) => {
  const { user, activeProfile, switchProfile, switchToHandler, logout } = useAuth();
  const [switching, setSwitching] = useState<ActiveProfile | null>(null);

  if (!user) return null;

  const allProfiles: ActiveProfile[] = [
    {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      type: "handler",
    },
    ...animalProfiles.map((a) => ({
      id: a.id,
      name: a.name,
      username: a.username,
      avatar: a.emoji,
      type: "animal" as const,
    })),
  ];

  const handleSwitch = (profile: ActiveProfile) => {
    if (profile.id === activeProfile?.id && profile.type === activeProfile.type) {
      onClose();
      return;
    }
    setSwitching(profile);
    setTimeout(() => {
      if (profile.type === "handler") switchToHandler();
      else switchProfile(profile);
      setSwitching(null);
      onClose();
      toast.success(`You're now ${profile.name}`, {
        description: `Switched to ${profile.type === "handler" ? "your handler account" : "pet profile"}`,
      });
    }, 900);
  };

  const handleLogout = () => {
    logout();
    onClose();
    toast.info("Signed out");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl bg-card border-t border-border max-h-[85vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex justify-center pt-2.5">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <h2 className="text-base font-bold text-foreground">Switch profile</h2>
              <button onClick={onClose} aria-label="Close profile switcher" className="p-1.5 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="w-4 h-4 text-muted-foreground" aria-hidden />
              </button>
            </div>
            <p className="px-5 text-xs text-muted-foreground -mt-1 mb-3">
              Posts, messages and notifications will reflect the selected profile.
            </p>

            <div className="px-3 grid grid-cols-1 gap-1.5">
              {allProfiles.map((p) => {
                const isActive =
                  activeProfile?.id === p.id && activeProfile?.type === p.type;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={`${p.type}-${p.id}`}
                    onClick={() => handleSwitch(p)}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                      isActive
                        ? "bg-primary/10 border border-primary/40"
                        : "hover:bg-secondary/60 border border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          p.type === "handler"
                            ? "bg-gradient-to-br from-primary/30 to-accent/30"
                            : "bg-gradient-to-br from-amber-400/20 to-pink-400/20"
                        }`}
                      >
                        {p.avatar}
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.type === "handler" ? "Handler · You" : `Pet · ${p.username}`}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mx-3 mt-3 grid grid-cols-1 gap-1 border-t border-border pt-2">
              <ActionRow
                icon={<Plus className="w-4 h-4" />}
                label="Create new pet profile"
                onClick={() => {
                  onClose();
                  toast("Tell us about your new pet");
                  setTimeout(() => (window.location.href = "/create"), 100);
                }}
              />
              <ActionRow
                icon={<Settings className="w-4 h-4" />}
                label="Profile settings"
                onClick={() => {
                  onClose();
                  setTimeout(() => (window.location.href = "/profile"), 100);
                }}
              />
              <ActionRow
                icon={<LogOut className="w-4 h-4" />}
                label="Log out"
                tone="destructive"
                onClick={handleLogout}
              />
            </div>
          </motion.div>

          {/* Switch splash */}
          <AnimatePresence>
            {switching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 200 }}
                  className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl bg-gradient-to-br from-primary/30 to-accent/30 shadow-2xl shadow-primary/30"
                >
                  {switching.avatar}
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mt-5 text-base font-semibold text-foreground"
                >
                  Switching to {switching.name}…
                </motion.p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ duration: 0.8 }}
                  className="mt-3 h-1 rounded-full bg-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

const ActionRow = ({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "destructive";
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors text-left ${
      tone === "destructive" ? "text-destructive" : "text-foreground"
    }`}
  >
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default ProfileSwitcherModal;
