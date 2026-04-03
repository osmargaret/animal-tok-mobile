import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Plus, MessageCircle, User, LogOut } from "lucide-react";

const BottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" active={isActive("/feed")} onClick={() => navigate("/feed")} />
        <NavItem icon={<Compass className="w-5 h-5" />} label="Explore" active={isActive("/explore")} onClick={() => navigate("/explore")} />
        <button onClick={() => navigate("/create")} className="flex flex-col items-center gap-0.5 -mt-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>
        <NavItem icon={<MessageCircle className="w-5 h-5" />} label="Inbox" badge={3} active={isActive("/inbox")} onClick={() => navigate("/inbox")} />
        <NavItem
          icon={<User className="w-5 h-5" />}
          label="Profile"
          active={isActive("/profile")}
          onClick={() => navigate("/profile")}
        />
      </div>
    </nav>
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
