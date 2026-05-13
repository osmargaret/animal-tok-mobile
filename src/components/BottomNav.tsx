import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Plus, MessageCircle, Bell } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import CreateOverlay from "@/components/CreateOverlay";

const BottomNav = () => {
  const { isAuthenticated, activeProfile } = useAuth();
  const { unreadTotal } = useMessaging();
  const { unreadCountFor } = useEngagement();
  const inboxBadge = activeProfile ? unreadTotal(activeProfile.id) : 0;
  const notifBadge = activeProfile ? unreadCountFor(activeProfile.id) : 0;
  const navigate = useNavigate();
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const requireAuth = (path: string) => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    navigate(path);
  };

  const handleCreate = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setCreateOpen(true);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
        <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavItem icon={<Home className="w-5 h-5" />} label="Home" active={isActive("/feed")} onClick={() => navigate("/feed")} />
          <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Marketplace" active={isActive("/marketplace")} onClick={() => navigate("/marketplace")} />
          <button onClick={handleCreate} className="flex flex-col items-center gap-0.5 -mt-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>
          <NavItem icon={<MessageCircle className="w-5 h-5" />} label="Inbox" badge={inboxBadge} active={isActive("/inbox")} onClick={() => requireAuth("/inbox")} />
          <NavItem icon={<Bell className="w-5 h-5" />} label="Notification" badge={notifBadge} active={isActive("/notifications")} onClick={() => requireAuth("/notifications")} />
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CreateOverlay open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
};

const NavItem = ({
  icon, label, active, badge, onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; badge?: number; onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 relative">
    <span className={active ? "text-foreground" : "text-muted-foreground"}>{icon}</span>
    <span className={`text-[10px] ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    {badge && (
      <span className="absolute -top-1 right-0 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default BottomNav;
