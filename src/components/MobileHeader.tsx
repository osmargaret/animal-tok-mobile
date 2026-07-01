import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Menu } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import HamburgerMenu from "@/components/HamburgerMenu";
import ProfileSwitcherModal from "@/components/ProfileSwitcherModal";
import GlobalSearch from "@/components/GlobalSearch";

const MobileHeader = () => {
  const { user, isAuthenticated, activeProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);


  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-base font-bold text-foreground">AnimalTok</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => setSwitcherOpen(true)}
                  aria-label="Switch profile"
                  className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg border border-primary/40 active:scale-95 transition-transform"
                >
                  {activeProfile?.avatar || user.avatar}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      activeProfile?.type === "animal" ? "bg-green-500" : "bg-primary"
                    }`}
                  />
                </button>
                <button onClick={() => setMenuOpen(true)} className="text-muted-foreground" aria-label="Menu">
                  <Menu className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ProfileSwitcherModal open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </>
  );
};

export default MobileHeader;
