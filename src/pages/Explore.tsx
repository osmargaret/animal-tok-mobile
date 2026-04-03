import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, MapPin, Star, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const categories = [
  { emoji: "🐕", label: "Dogs", count: "12.5K" },
  { emoji: "🐈", label: "Cats", count: "9.8K" },
  { emoji: "🦜", label: "Birds", count: "4.2K" },
  { emoji: "🐴", label: "Horses", count: "3.1K" },
  { emoji: "🐠", label: "Fish", count: "2.7K" },
  { emoji: "🐇", label: "Rabbits", count: "1.9K" },
  { emoji: "🦎", label: "Reptiles", count: "1.4K" },
  { emoji: "🐹", label: "Small Pets", count: "1.1K" },
];

const trendingTags = [
  { tag: "#puppylove", posts: "24.5K posts", trend: "+12%" },
  { tag: "#catlife", posts: "18.3K posts", trend: "+8%" },
  { tag: "#exoticpets", posts: "6.7K posts", trend: "+23%" },
  { tag: "#pettraining", posts: "11.2K posts", trend: "+5%" },
  { tag: "#rescuepets", posts: "9.1K posts", trend: "+15%" },
];

const featuredHandlers = [
  { name: "Bailey's World", handle: "@bailey.thelab", avatar: "🐕", followers: "45.2K", verified: true },
  { name: "Luna Cat", handle: "@luna.cat", avatar: "🐈", followers: "32.1K", verified: true },
  { name: "Coco Parrot", handle: "@coco.parrot", avatar: "🦜", followers: "28.7K", verified: false },
  { name: "Max the Horse", handle: "@max.horse", avatar: "🐴", followers: "19.3K", verified: true },
];

const nearbyPets = [
  { name: "Rocky", breed: "German Shepherd", distance: "0.5 mi", image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200&h=200&fit=crop" },
  { name: "Whiskers", breed: "Persian Cat", distance: "1.2 mi", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop" },
  { name: "Tweety", breed: "Canary", distance: "2.0 mi", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop" },
  { name: "Buddy", breed: "Golden Retriever", distance: "3.1 mi", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop" },
];

const Explore = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <h1 className="text-lg font-bold mb-3">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search animals, handlers, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Categories */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button key={cat.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">{cat.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Trending
            </h2>
            <button className="text-xs text-primary">See all</button>
          </div>
          <div className="space-y-1">
            {trendingTags.map((t) => (
              <button key={t.tag} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-semibold text-primary">{t.tag}</p>
                  <p className="text-xs text-muted-foreground">{t.posts}</p>
                </div>
                <span className="text-xs font-medium text-emerald-400">{t.trend}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Handlers */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary" /> Featured Handlers
            </h2>
            <button className="text-xs text-primary">See all</button>
          </div>
          <div className="space-y-2">
            {featuredHandlers.map((h) => (
              <button key={h.handle} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl">
                  {h.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold">{h.name}</span>
                    {h.verified && <span className="text-primary text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{h.handle} · {h.followers} followers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        {/* Nearby */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Nearby
            </h2>
            <button className="text-xs text-primary">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {nearbyPets.map((p) => (
              <div key={p.name} className="flex-shrink-0 w-36 rounded-xl bg-card border border-border overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-28 object-cover" />
                <div className="p-2.5">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.breed}</p>
                  <p className="text-[11px] text-primary mt-1">📍 {p.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Explore;
