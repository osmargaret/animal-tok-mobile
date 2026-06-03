import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Plus, Briefcase, Eye, MousePointerClick, BarChart3, Search, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import AdCard from "@/components/AdCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";

const Ads = () => {
  const navigate = useNavigate();
  const { activeProfile, accountType, businessName, user } = useAuth();
  const { ads, statsFor } = useEngagement();
  const profileId = activeProfile?.id || user?.id || "";
  const isBusiness = accountType === "business";
  const [tab, setTab] = useState<"mine" | "all">("mine");
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();

  const matches = (a: typeof ads[number]) =>
    !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || (a.createdByName || "").toLowerCase().includes(q);
  const mine = ads.filter((a) => a.createdBy === profileId && matches(a));
  const list = tab === "mine" ? mine : ads.filter(matches);

  // Aggregate analytics across owner's ads
  const totals = mine.reduce(
    (acc, a) => {
      const s = statsFor(a.id);
      acc.views += s.views;
      acc.clicks += s.clicks;
      return acc;
    },
    { views: 0, clicks: 0 }
  );
  const ctr = totals.views > 0 ? ((totals.clicks / totals.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <MobileHeader />
      <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isBusiness ? <Briefcase className="w-4 h-4 text-primary" /> : <Megaphone className="w-4 h-4 text-primary" />}
          <h1 className="text-base font-semibold truncate">
            {isBusiness ? `${businessName || "Business"} · Ads` : "My Ads"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/create-ad")}
          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads…"
            aria-label="Search ads"
            className="w-full bg-secondary rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              <X className="w-4 h-4 text-muted-foreground" aria-hidden />
            </button>
          )}
        </div>

        {isBusiness && (
          <section className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30 p-4 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Business Ads</p>
              <p className="text-sm font-bold mt-0.5">
                {mine.length} live {mine.length === 1 ? "ad" : "ads"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Performance is updated in real time as people see and tap your ads.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric icon={<Eye className="w-3.5 h-3.5" />} label="Views" value={totals.views} />
              <Metric icon={<MousePointerClick className="w-3.5 h-3.5" />} label="Clicks" value={totals.clicks} />
              <Metric icon={<BarChart3 className="w-3.5 h-3.5" />} label="CTR" value={`${ctr}%`} />
            </div>
          </section>
        )}

        <div className="flex gap-2 p-1 rounded-xl bg-secondary/50">
          {(["mine", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "mine" ? `Mine (${mine.length})` : `All (${ads.length})`}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <Megaphone className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-semibold">{tab === "mine" ? "No ads yet" : "Nothing here yet"}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 px-6">
              {tab === "mine"
                ? "Create an ad to promote a product, service, or message to the community."
                : "Ads from the community will appear here as they go live."}
            </p>
            {tab === "mine" && (
              <button
                onClick={() => navigate("/create-ad")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Create your first ad
              </button>
            )}
          </div>
        ) : (
          list.map((ad) => <AdCard key={`${profileId}:${ad.id}`} ad={ad} />)
        )}
      </main>

      {isBusiness ? <BusinessBottomNav /> : <BottomNav />}
    </div>
  );
};

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <div className="rounded-xl bg-background/60 border border-border px-3 py-2">
    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      {icon}
      {label}
    </div>
    <p className="text-base font-bold mt-0.5">{value}</p>
  </div>
);

export default Ads;
