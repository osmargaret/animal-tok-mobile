import { useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import BackButton from "@/components/BackButton";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import AdCard from "@/components/AdCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";

const Ads = () => {
  const navigate = useNavigate();
  const { activeProfile, accountType } = useAuth();
  const { ads } = useEngagement();
  const profileId = activeProfile?.id || "";
  const mine = ads.filter((a) => a.createdBy === profileId);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <MobileHeader />
      <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton />
        <div className="flex items-center gap-2 flex-1">
          <Megaphone className="w-4 h-4 text-primary" />
          <h1 className="text-base font-semibold">My Ads</h1>
        </div>
        <button
          onClick={() => navigate("/create-ad")}
          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {mine.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <Megaphone className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-semibold">No ads yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 px-6">
              Create an ad to promote a product, service, or message to the community.
            </p>
            <button
              onClick={() => navigate("/create-ad")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Create your first ad
            </button>
          </div>
        ) : (
          mine.map((ad) => <AdCard key={ad.id} ad={ad} />)
        )}
      </main>

      {accountType === "business" ? <BusinessBottomNav /> : <BottomNav />}
    </div>
  );
};

export default Ads;
