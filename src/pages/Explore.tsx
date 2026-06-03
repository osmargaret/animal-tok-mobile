import { useState } from "react";
import { Search, X, TrendingUp, MapPin, Star, ChevronRight, Play, Calendar, ShoppingBag, Wrench } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import DesktopSidebar from "@/components/DesktopSidebar";
import BackButton from "@/components/BackButton";

const exploreTabs = ["Posts", "Live Video", "Events", "Products", "Services"] as const;

const postItems = [
  { id: 1, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop", type: "image" as const },
  { id: 2, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop", type: "video" as const },
  { id: 3, image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop", type: "image" as const },
  { id: 4, image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=300&fit=crop", type: "video" as const },
  { id: 5, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop", type: "image" as const },
  { id: 6, image: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=300&h=300&fit=crop", type: "video" as const },
  { id: 7, image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop", type: "image" as const },
  { id: 8, image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=300&fit=crop", type: "video" as const },
  { id: 9, image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&h=300&fit=crop", type: "image" as const },
];

const liveVideos = [
  { id: 1, title: "Morning walk with Max 🐕", viewer: 234, avatar: "🐕", name: "Max", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop" },
  { id: 2, title: "Cat yoga session 🧘‍♀️", viewer: 567, avatar: "🐈", name: "Luna", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop" },
  { id: 3, title: "Parrot singing contest 🎤", viewer: 123, avatar: "🦜", name: "Coco", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop" },
  { id: 4, title: "Horse racing practice 🏇", viewer: 892, avatar: "🐴", name: "Spirit", image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop" },
];

const eventItems = [
  { id: 1, title: "Dog Park Meetup", date: "Apr 12", location: "Central Park", attendees: 45, image: "🐕" },
  { id: 2, title: "Cat Show 2024", date: "Apr 18", location: "Convention Center", attendees: 200, image: "🐈" },
  { id: 3, title: "Horse Training Camp", date: "Apr 25", location: "Green Valley Ranch", attendees: 30, image: "🐴" },
  { id: 4, title: "Pet Adoption Day", date: "May 1", location: "City Hall", attendees: 150, image: "🐾" },
];

const productItems = [
  { id: 1, name: "Premium Dog Food", price: "$24.99", seller: "PetNutrition", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop" },
  { id: 2, name: "Cat Tower Deluxe", price: "$89.99", seller: "CatWorld", image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=200&h=200&fit=crop" },
  { id: 3, name: "Pet GPS Tracker", price: "$49.99", seller: "TechPets", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop" },
  { id: 4, name: "Bird Seeds Mix", price: "$12.99", seller: "BirdLover", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop" },
];

const serviceItems = [
  { id: 1, name: "Dog Grooming", provider: "PawSpa", price: "From $35", location: "2.1 mi", icon: "🛁" },
  { id: 2, name: "Pet Sitting", provider: "PetWatch", price: "From $25/day", location: "1.5 mi", icon: "🏠" },
  { id: 3, name: "Vet Checkup", provider: "Dr. Sarah's", price: "From $50", location: "3.0 mi", icon: "🩺" },
  { id: 4, name: "Dog Training", provider: "K9 Academy", price: "From $40", location: "4.2 mi", icon: "🎓" },
];

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<typeof exploreTabs[number]>("Posts");
  const q = search.trim().toLowerCase();
  const filteredLive = liveVideos.filter((v) => !q || v.title.toLowerCase().includes(q) || v.name.toLowerCase().includes(q));
  const filteredEvents = eventItems.filter((e) => !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
  const filteredProducts = productItems.filter((p) => !q || p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q));
  const filteredServices = serviceItems.filter((s) => !q || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-4">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="lg:ml-60">
        {/* Header with search */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] lg:pt-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <BackButton />
            <span className="text-sm font-semibold">Explore</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search animals, handlers, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              aria-label="Search explore"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                <X className="w-4 h-4 text-muted-foreground" aria-hidden />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {exploreTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Posts tab - grid of images/videos */}
          {activeTab === "Posts" && (
            <div className="grid grid-cols-3 gap-1">
              {postItems.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-sm">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                  {item.type === "video" && (
                    <div className="absolute top-1.5 right-1.5">
                      <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Live Video tab */}
          {activeTab === "Live Video" && (
            <div className="space-y-3">
              {liveVideos.map((v) => (
                <div key={v.id} className="rounded-xl overflow-hidden bg-card border border-border">
                  <div className="relative h-44">
                    <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-[10px]">
                      {v.viewer} watching
                    </div>
                  </div>
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">{v.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold">{v.title}</p>
                      <p className="text-xs text-muted-foreground">{v.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Events tab */}
          {activeTab === "Events" && (
            <div className="space-y-3">
              {eventItems.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">{e.image}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{e.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {e.date} · <MapPin className="w-3 h-3" /> {e.location}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{e.attendees} attending</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}

          {/* Products tab */}
          {activeTab === "Products" && (
            <div className="grid grid-cols-2 gap-3">
              {productItems.map((p) => (
                <div key={p.id} className="rounded-xl bg-card border border-border overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.seller}</p>
                    <p className="text-sm font-bold text-primary mt-1">{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Services tab */}
          {activeTab === "Services" && (
            <div className="space-y-3">
              {serviceItems.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">{s.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.provider}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-primary">{s.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {s.location}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Explore;
