import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, RefreshCw, Store, Megaphone, LogOut, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { animalProfiles } from "@/data/animalProfiles";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

const HamburgerMenu = ({ open, onClose }: HamburgerMenuProps) => {
  const { user, activeProfile, switchProfile, switchToHandler, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [petSwitchOpen, setPetSwitchOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSwitchPet = (animal: typeof animalProfiles[0]) => {
    switchProfile({
      id: animal.id,
      name: animal.name,
      username: `@${animal.name.toLowerCase()}`,
      avatar: animal.emoji,
      type: "animal",
    });
    setPetSwitchOpen(false);
    onClose();
    navigate(`/animal/${animal.id}`);
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[280px] bg-card border-l border-border overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="text-sm font-bold">Menu</span>
              <button onClick={onClose} aria-label="Close menu" className="p-1.5 rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="w-5 h-5 text-muted-foreground" aria-hidden />
              </button>
            </div>

            {/* Handler Info */}
            <button
              onClick={() => handleNavigate("/profile")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <div className="w-11 h-11 rounded-full bg-primary/30 flex items-center justify-center text-xl border-2 border-primary">
                {user.avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.username} · Handler</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Active Pet */}
            <button
              onClick={() => setPetSwitchOpen(!petSwitchOpen)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <div className={`w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl ${
                activeProfile?.type === "animal" ? "border-2 border-green-500" : ""
              }`}>
                {activeProfile?.type === "animal" ? activeProfile.avatar : animalProfiles[0]?.emoji || "🐾"}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">
                  {activeProfile?.type === "animal" ? activeProfile.name : "Switch Pet"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Switch active pet
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Pet switch dropdown */}
            <AnimatePresence>
              {petSwitchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-border bg-secondary/20"
                >
                  {/* Switch to handler */}
                  <button
                    onClick={() => {
                      switchToHandler();
                      setPetSwitchOpen(false);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-6 py-2.5 hover:bg-secondary/50 ${
                      activeProfile?.type === "handler" ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm">
                      {user.avatar}
                    </div>
                    <span className="text-sm">{user.name}</span>
                    {activeProfile?.type === "handler" && (
                      <span className="text-[10px] text-primary font-medium ml-auto">Active</span>
                    )}
                  </button>
                  {animalProfiles.map((animal) => (
                    <button
                      key={animal.id}
                      onClick={() => handleSwitchPet(animal)}
                      className={`w-full flex items-center gap-3 px-6 py-2.5 hover:bg-secondary/50 ${
                        activeProfile?.id === animal.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                        {animal.emoji}
                      </div>
                      <div className="text-left">
                        <span className="text-sm">{animal.name}</span>
                        <p className="text-[10px] text-muted-foreground">{animal.breed}</p>
                      </div>
                      {activeProfile?.id === animal.id && (
                        <span className="text-[10px] text-primary font-medium ml-auto">Active</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu items */}
            <div className="py-2">
              <MenuItem icon={<Store className="w-4 h-4" />} label="Business" onClick={() => handleNavigate("/store")} />
              <MenuItem icon={<Megaphone className="w-4 h-4" />} label="Ads" onClick={() => handleNavigate("/ads")} />
              <MenuItem
                icon={theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                label={theme === "dark" ? "Light mode" : "Dark mode"}
                onClick={toggle}
              />
            </div>

            <div className="border-t border-border py-2">
              <MenuItem icon={<LogOut className="w-4 h-4 text-destructive" />} label="Logout" className="text-destructive" onClick={handleLogout} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MenuItem = ({ icon, label, className, onClick }: { icon: React.ReactNode; label: string; className?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-sm ${className || ""}`}
  >
    {icon}
    {label}
  </button>
);

export default HamburgerMenu;
