import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Compass, Users, Calendar, ShoppingBag, UserPlus, MessageCircle, Radio, LogOut } from "lucide-react";
import AuthModal from "@/components/AuthModal";

interface DesktopSidebarProps {
  onEventsOpen: () => void;
}

const DesktopSidebar = ({ onEventsOpen }: DesktopSidebarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-2xl">🐾</span>
        <span className="text-xl font-bold text-foreground">AnimalTok</span>
      </div>

      <div className="flex gap-2 px-5 mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/20 text-destructive text-xs font-semibold">
          <Radio className="w-3 h-3" /> Live
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
          <Compass className="w-3 h-3" /> Explore
        </button>
      </div>

      <div className="px-5 mb-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Explore</p>
      </div>

      <nav className="flex flex-col gap-1 px-3 flex-1">
        <SidebarItem icon={<Users className="w-4 h-4" />} label="Communities" />
        <SidebarItem icon={<Calendar className="w-4 h-4" />} label="Events" onClick={onEventsOpen} />
        <SidebarItem icon={<ShoppingBag className="w-4 h-4" />} label="Marketplace" />
        <SidebarItem icon={<UserPlus className="w-4 h-4" />} label="Friends" badge={2} />
        <SidebarItem icon={<MessageCircle className="w-4 h-4" />} label="Messages" badge={3} />
      </nav>

      {/* User profile section */}
      {user && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-lg border-2 border-primary">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </aside>
  );
};

const SidebarItem = ({ icon, label, badge, onClick }: { icon: React.ReactNode; label: string; badge?: number; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

export default DesktopSidebar;
