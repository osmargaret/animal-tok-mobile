import { useNavigate } from "react-router-dom";
import { Briefcase, ShoppingBag, Wrench, Megaphone, MessageCircle, CreditCard, TrendingUp, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { useMessaging } from "@/contexts/MessagingContext";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import BackButton from "@/components/BackButton";
import MobileHeader from "@/components/MobileHeader";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, activeProfile, businessName } = useAuth();
  const { ads, ordersFor, cartCount } = useEngagement();
  const { unreadTotal } = useMessaging();
  const profileId = activeProfile?.id || user?.id || "";
  const myAds = ads.filter((a) => a.createdBy === profileId);
  const myOrders = ordersFor(profileId);
  const myInbox = unreadTotal(profileId);
  const myCart = cartCount(profileId);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <MobileHeader />
      <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton to="/feed" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Briefcase className="w-4 h-4 text-primary shrink-0" />
          <h1 className="text-base font-semibold truncate">{businessName || user?.name || "Business"}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30 p-5">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Welcome back</p>
          <h2 className="text-xl font-bold mt-1">Your business at a glance</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage products, services, and ads from one place.</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Stat icon={<Megaphone className="w-4 h-4" />} label="Active ads" value={myAds.length} onClick={() => navigate("/ads")} />
          <Stat icon={<Package className="w-4 h-4" />} label="Orders" value={myOrders.length} onClick={() => navigate("/checkout")} />
          <Stat icon={<MessageCircle className="w-4 h-4" />} label="Unread" value={myInbox} onClick={() => navigate("/inbox")} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Cart items" value={myCart} onClick={() => navigate("/checkout")} />
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Quick actions</p>
          <div className="grid grid-cols-2 gap-3">
            <Action icon={<ShoppingBag className="w-5 h-5" />} label="My products" onClick={() => navigate("/store")} />
            <Action icon={<Wrench className="w-5 h-5" />} label="Browse services" onClick={() => navigate("/marketplace")} />
            <Action icon={<Megaphone className="w-5 h-5" />} label="Create an ad" onClick={() => navigate("/create-ad")} />
            <Action icon={<CreditCard className="w-5 h-5" />} label="Subscriptions" onClick={() => navigate("/business/subscriptions")} />
          </div>
        </section>
      </main>

      <BusinessBottomNav />
    </div>
  );
};

const Stat = ({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: number; onClick: () => void }) => (
  <button onClick={onClick} className="text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
    <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </button>
);

const Action = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium">
    <span className="text-primary">{icon}</span>
    {label}
  </button>
);

export default BusinessDashboard;
