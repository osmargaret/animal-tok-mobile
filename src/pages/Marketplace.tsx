import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Star, MapPin, ChevronRight, ShoppingBag, Wrench, Megaphone, ShoppingCart, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import DesktopSidebar from "@/components/DesktopSidebar";
import AdCard from "@/components/AdCard";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const tabs = ["Products", "Services", "Ads"] as const;

const products = [
  { id: 1, name: "Premium Dog Food", price: "$24.99", seller: "PetNutrition Co", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop", category: "Food" },
  { id: 2, name: "Cat Climbing Tower", price: "$89.99", seller: "CatWorld", rating: 4.6, reviews: 87, image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=300&fit=crop", category: "Accessories" },
  { id: 3, name: "Pet GPS Tracker", price: "$49.99", seller: "TechPets", rating: 4.9, reviews: 203, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop", category: "Tech" },
  { id: 4, name: "Organic Bird Seeds", price: "$12.99", seller: "BirdLover", rating: 4.5, reviews: 56, image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop", category: "Food" },
  { id: 5, name: "Dog Leash Set", price: "$19.99", seller: "WalkTime", rating: 4.7, reviews: 145, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop", category: "Accessories" },
  { id: 6, name: "Aquarium Filter", price: "$34.99", seller: "AquaWorld", rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=300&h=300&fit=crop", category: "Equipment" },
];

const services = [
  { id: 1, name: "Dog Grooming", provider: "PawSpa", price: "From $35", rating: 4.9, reviews: 312, location: "2.1 mi", icon: "🛁" },
  { id: 2, name: "Pet Sitting", provider: "PetWatch", price: "From $25/day", rating: 4.7, reviews: 189, location: "1.5 mi", icon: "🏠" },
  { id: 3, name: "Vet Checkup", provider: "Dr. Sarah's Clinic", price: "From $50", rating: 4.8, reviews: 456, location: "3.0 mi", icon: "🩺" },
  { id: 4, name: "Dog Training", provider: "K9 Academy", price: "From $40/session", rating: 4.6, reviews: 98, location: "4.2 mi", icon: "🎓" },
  { id: 5, name: "Pet Photography", provider: "PawShots", price: "From $75", rating: 4.9, reviews: 67, location: "5.0 mi", icon: "📸" },
  { id: 6, name: "Horse Boarding", provider: "Green Pastures", price: "From $300/mo", rating: 4.5, reviews: 34, location: "8.5 mi", icon: "🐴" },
];

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Products");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<"relevance" | "priceAsc" | "priceDesc" | "rating">("relevance");
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const { ads, cartCount } = useEngagement();
  const myCart = activeProfile ? cartCount(activeProfile.id) : 0;
  const q = search.trim().toLowerCase();

  const numericPrice = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  const filteredProducts = products
    .filter((p) => (!q || p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && p.rating >= minRating)
    .sort((a, b) => {
      if (sort === "priceAsc") return numericPrice(a.price) - numericPrice(b.price);
      if (sort === "priceDesc") return numericPrice(b.price) - numericPrice(a.price);
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  const filteredServices = services
    .filter((s) => (!q || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q)) && s.rating >= minRating)
    .sort((a, b) => (sort === "rating" ? b.rating - a.rating : 0));

  const filteredAds = ads.filter(
    (a) => !search || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
  );
  const activeFilterCount = (sort !== "relevance" ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="lg:ml-60">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] lg:pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BackButton />
              <h1 className="text-lg font-bold">Marketplace</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => navigate("/checkout")} className="relative p-2 rounded-lg bg-secondary" aria-label="Cart">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                {myCart > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {myCart}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFiltersOpen(true)}
                className="relative p-2 rounded-lg bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Filters and sort"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" aria-hidden />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, services, ads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                <X className="w-4 h-4 text-muted-foreground" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {tab === "Products" && <ShoppingBag className="w-3.5 h-3.5" />}
                {tab === "Services" && <Wrench className="w-3.5 h-3.5" />}
                {tab === "Ads" && <Megaphone className="w-3.5 h-3.5" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          {activeTab === "Products" && (
            filteredProducts.length === 0 ? (
              <EmptyState label="No products match your search" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((p) => (
                  <button key={p.id} onClick={() => navigate(`/product/${p.id}`)} aria-label={`Open ${p.name}`} className="text-left cursor-pointer rounded-xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <img src={p.image} alt={p.name} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.seller}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary">{p.price}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" aria-hidden />
                          <span className="text-xs text-muted-foreground">{p.rating}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === "Services" && (
            filteredServices.length === 0 ? (
              <EmptyState label="No services match your search" />
            ) : (
              <div className="space-y-3">
                {filteredServices.map((s) => (
                <button key={s.id} onClick={() => navigate(`/service/${s.id}`)} className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                    {s.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.provider}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-primary">{s.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {s.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 mb-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{s.rating}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "Ads" && (
            <div className="space-y-4">
              <button
                onClick={() => navigate("/create-ad")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Create new ad
              </button>
              {filteredAds.length === 0 ? (
                <div className="text-center py-12">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">No ads yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to publish a sponsored post.</p>
                </div>
              ) : (
                filteredAds.map((ad) => <AdCard key={`${activeProfile?.id || "anon"}:${ad.id}`} ad={ad} />)
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Marketplace;
