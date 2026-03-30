import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

const MobileHeader = () => {
  const { user } = useAuth();

  return (
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
          {user && (
            <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-sm border border-primary">
              {user.avatar}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
