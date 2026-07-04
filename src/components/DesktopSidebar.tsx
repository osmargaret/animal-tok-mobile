import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Compass, Users, Calendar, ShoppingBag, UserPlus, MessageCircle, Radio, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import GlobalSearch from "@/components/GlobalSearch";
import { useEngagement } from "@/contexts/EngagementContext";

interface DesktopSidebarProps {
  onEventsOpen: () => void;
}

const DesktopSidebar = ({ onEventsOpen }: DesktopSidebarProps) => {
  const { user, activeProfile, isAuthenticated, logout } = useAuth();
  const { unreadCountFor } = useEngagement();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const unread = activeProfile ? unreadCountFor(activeProfile.id) : 0;

  return (
    <>
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-2xl">🐾</span>
        <span className="text-xl font-bold text-foreground">AnimalTok</span>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">⌘K</span>
      </button>

      <div className="flex gap-2 px-5 mb-4">
        <button onClick={() => navigate("/feed")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/30 transition-colors">
          <Radio className="w-3 h-3" /> Live
        </button>
        <button onClick={() => navigate("/explore")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors">
          <Compass className="w-3 h-3" /> Explore
        </button>
      </div>

      <div className="px-5 mb-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Explore</p>
      </div>

      <nav className="flex flex-col gap-1 px-3 flex-1">
        <SidebarItem icon={<Users className="w-4 h-4" />} label="Communities" onClick={() => navigate("/explore")} />
        <SidebarItem icon={<Calendar className="w-4 h-4" />} label="Events" onClick={onEventsOpen} />
        <SidebarItem icon={<ShoppingBag className="w-4 h-4" />} label="Marketplace" onClick={() => navigate("/marketplace")} />
        <SidebarItem icon={<UserPlus className="w-4 h-4" />} label="Friends" onClick={() => navigate("/explore")} />
        <SidebarItem icon={<MessageCircle className="w-4 h-4" />} label="Messages" onClick={() => navigate("/inbox")} />
        <SidebarItem icon={<Bell className="w-4 h-4" />} label="Notifications" badge={unread || undefined} onClick={() => navigate("/notifications")} />
      </nav>

      {isAuthenticated && user ? (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-3 mb-3 hover:bg-sidebar-accent rounded-lg p-1 -m-1 transition-colors">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-lg border-2 border-primary">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.username}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <button
            onClick={() => setAuthOpen(true)}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in / Create account
          </button>
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </aside>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

const SidebarItem = ({ icon, label, badge, onClick }: { icon: React.ReactNode; label: string; badge?: number; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
