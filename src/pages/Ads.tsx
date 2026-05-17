import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Plus, Briefcase } from "lucide-react";
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
  const { ads } = useEngagement();
  const profileId = activeProfile?.id || user?.id || "";
  const isBusiness = accountType === "business";
  const [tab, setTab] = useState<"mine" | "all">("mine");

  const mine = ads.filter((a) => a.createdBy === profileId);
  const list = tab === "mine" ? mine : ads;

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
        {isBusiness && (
          <section className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30 p-4">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Business Ads Feed</p>
            <p className="text-sm font-bold mt-0.5">{mine.length} live {mine.length === 1 ? "ad" : "ads"}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Manage what your business is promoting. Publish photo, video, or text ads to reach more pet owners.
            </p>
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

export default Ads;
