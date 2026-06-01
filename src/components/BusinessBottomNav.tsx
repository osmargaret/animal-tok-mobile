import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Wrench, CalendarDays, Megaphone, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";

const items = [
  { path: "/business/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/store", label: "Products", icon: ShoppingBag },
  { path: "/marketplace", label: "Services", icon: Wrench },
  { path: "/events", label: "Events", icon: CalendarDays },
  { path: "/ads", label: "Ads", icon: Megaphone },
  { path: "/inbox", label: "Messages", icon: MessageCircle },
];

const BusinessBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProfile } = useAuth();
  const { unreadTotal } = useMessaging();
  const inboxBadge = activeProfile ? unreadTotal(activeProfile.id) : 0;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <div className="grid grid-cols-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((it) => {
          const Icon = it.icon;
          const active = location.pathname === it.path || location.pathname.startsWith(it.path + "/");
          const badge = it.path === "/inbox" ? inboxBadge : 0;
          return (
            <button
              key={it.path}
              onClick={() => navigate(it.path)}
              className="relative flex flex-col items-center gap-0.5"
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[9px] ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {it.label}
              </span>
              {badge > 0 && (
                <span className="absolute -top-1 right-3 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BusinessBottomNav;
