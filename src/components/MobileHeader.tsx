import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import AuthModal from "@/components/AuthModal";

const MobileHeader = () => {
  const { user, isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-base font-bold text-foreground">AnimalTok</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground">
              <Search className="w-5 h-5" />
            </button>
            {isAuthenticated && user ? (
              <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-sm border border-primary">
                {user.avatar}
              </div>
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
    </>
  );
};

export default MobileHeader;
