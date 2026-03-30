import { useState } from "react";
import { Search } from "lucide-react";

interface MobileHeaderProps {
  onAuthOpen: () => void;
}

const MobileHeader = ({ onAuthOpen }: MobileHeaderProps) => {
  const [activeTab, setActiveTab] = useState("foryou");

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass">
      <div className="flex items-center justify-between px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="text-base font-bold text-foreground">AnimalTok</span>
        </div>

        <div className="flex items-center gap-1">
          {(["Explore", "Following", "For You"] as const).map((tab) => {
            const key = tab.toLowerCase().replace(/\s/g, "");
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <button className="text-muted-foreground">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
