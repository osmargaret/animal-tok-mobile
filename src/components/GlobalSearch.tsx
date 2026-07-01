import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp, User, PawPrint, ShoppingBag, Megaphone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animalProfiles } from "@/data/animalProfiles";
import { useEngagement } from "@/contexts/EngagementContext";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type EntityKind = "people" | "pets" | "products" | "ads" | "events";

const TABS: { key: "all" | EntityKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "pets", label: "Pets" },
  { key: "products", label: "Products" },
  { key: "ads", label: "Ads" },
  { key: "events", label: "Events" },
];

const RECENT_KEY = "at_recent_searches";
const TRENDING = ["golden retriever", "cat tower", "dog grooming", "adoption", "puppy training"];

/* Static-ish datasets for cross-entity search */
const PEOPLE = [
  { id: "alex", name: "Alex Chen", username: "@alex.handler", avatar: "🧑", route: "/profile" },
  { id: "sara", name: "Sara Kim", username: "@sara.k", avatar: "👩", route: "/profile" },
  { id: "mike", name: "Mike Rivera", username: "@mike.r", avatar: "👨", route: "/profile" },
];

const PRODUCTS = [
  { id: 1, name: "Premium Dog Food", seller: "PetNutrition Co", price: "$24.99", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100&h=100&fit=crop" },
  { id: 2, name: "Cat Climbing Tower", seller: "CatWorld", price: "$89.99", image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=100&h=100&fit=crop" },
  { id: 3, name: "Pet GPS Tracker", seller: "TechPets", price: "$49.99", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop" },
  { id: 4, name: "Organic Bird Seeds", seller: "BirdLover", price: "$12.99", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=100&h=100&fit=crop" },
  { id: 5, name: "Dog Leash Set", seller: "WalkTime", price: "$19.99", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop" },
];

const EVENTS = [
  { id: 1, title: "Dog Park Meetup", date: "Apr 12", location: "Central Park", icon: "🐕" },
  { id: 2, title: "Cat Show 2024", date: "Apr 18", location: "Convention Center", icon: "🐈" },
  { id: 3, title: "Horse Training Camp", date: "Apr 25", location: "Green Valley", icon: "🐴" },
  { id: 4, title: "Pet Adoption Day", date: "May 1", location: "City Hall", icon: "🐾" },
];

const matches = (needle: string, ...hay: (string | undefined)[]) =>
  hay.some((h) => (h || "").toLowerCase().includes(needle));

const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const { ads } = useEngagement();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTab("all");
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      setRecent(raw ? JSON.parse(raw) : []);
    } catch {
      setRecent([]);
    }
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const query = q.trim().toLowerCase();

  const rPeople = useMemo(
    () => (!query ? [] : PEOPLE.filter((p) => matches(query, p.name, p.username))),
    [query]
  );
  const rPets = useMemo(
    () => (!query ? [] : animalProfiles.filter((a) => matches(query, a.name, a.username, a.breed, a.bio))),
    [query]
  );
  const rProducts = useMemo(
    () => (!query ? [] : PRODUCTS.filter((p) => matches(query, p.name, p.seller))),
    [query]
  );
  const rAds = useMemo(
    () => (!query ? [] : ads.filter((a) => matches(query, a.title, a.body, a.createdByName))),
    [query, ads]
  );
  const rEvents = useMemo(
    () => (!query ? [] : EVENTS.filter((e) => matches(query, e.title, e.location))),
    [query]
  );

  const totals = { people: rPeople.length, pets: rPets.length, products: rProducts.length, ads: rAds.length, events: rEvents.length };
  const totalHits = totals.people + totals.pets + totals.products + totals.ads + totals.events;

  const commitRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const go = (path: string) => {
    commitRecent(q);
    onClose();
    navigate(path);
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  const showKind = (k: EntityKind) => tab === "all" || tab === k;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[70] left-1/2 -translate-x-1/2 top-4 lg:top-10 w-[95vw] max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            role="dialog"
            aria-label="Global search"
          >
            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && q.trim()) commitRecent(q);
                }}
                placeholder="Search people, pets, products, ads, events…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                aria-label="Search everything"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  aria-label="Clear"
                  className="p-1 rounded-md hover:bg-secondary"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide">
              {TABS.map((t) => {
                const count =
                  t.key === "all" ? totalHits : (totals as Record<string, number>)[t.key] || 0;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t.label}
                    {query && count > 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Empty state (no query) */}
              {!query && (
                <div className="p-4 space-y-5">
                  {recent.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Recent
                        </p>
                        <button onClick={clearRecent} className="text-[11px] text-primary hover:underline">
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQ(r)}
                            className="px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-secondary/80"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Trending
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING.map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ(t)}
                          className="px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-secondary/80"
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                      Suggestions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {animalProfiles.slice(0, 4).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => go(`/animal/${a.id}`)}
                          className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 hover:bg-secondary text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                            {a.emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{a.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{a.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Results */}
              {query && totalHits === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <Search className="w-10 h-10 text-muted-foreground mb-3" aria-hidden />
                  <p className="text-sm font-medium">No results for “{q}”</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different word or check spelling.</p>
                </div>
              )}

              {query && totalHits > 0 && (
                <div className="divide-y divide-border">
                  {showKind("people") && rPeople.length > 0 && (
                    <Section title="People" icon={<User className="w-3.5 h-3.5" />}>
                      {rPeople.map((p) => (
                        <Row
                          key={p.id}
                          onClick={() => go(p.route)}
                          left={
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                              {p.avatar}
                            </div>
                          }
                          title={p.name}
                          subtitle={p.username}
                        />
                      ))}
                    </Section>
                  )}

                  {showKind("pets") && rPets.length > 0 && (
                    <Section title="Pets" icon={<PawPrint className="w-3.5 h-3.5" />}>
                      {rPets.map((a) => (
                        <Row
                          key={a.id}
                          onClick={() => go(`/animal/${a.id}`)}
                          left={
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg">
                              {a.emoji}
                            </div>
                          }
                          title={a.name}
                          subtitle={`${a.username} · ${a.breed}`}
                        />
                      ))}
                    </Section>
                  )}

                  {showKind("products") && rProducts.length > 0 && (
                    <Section title="Products" icon={<ShoppingBag className="w-3.5 h-3.5" />}>
                      {rProducts.map((p) => (
                        <Row
                          key={p.id}
                          onClick={() => go(`/product/${p.id}`)}
                          left={<img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                          title={p.name}
                          subtitle={`${p.seller} · ${p.price}`}
                        />
                      ))}
                    </Section>
                  )}

                  {showKind("ads") && rAds.length > 0 && (
                    <Section title="Ads" icon={<Megaphone className="w-3.5 h-3.5" />}>
                      {rAds.map((a) => (
                        <Row
                          key={a.id}
                          onClick={() => go("/ads")}
                          left={
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                              <Megaphone className="w-4 h-4" />
                            </div>
                          }
                          title={a.title}
                          subtitle={a.createdByName || "Sponsored"}
                        />
                      ))}
                    </Section>
                  )}

                  {showKind("events") && rEvents.length > 0 && (
                    <Section title="Events" icon={<Calendar className="w-3.5 h-3.5" />}>
                      {rEvents.map((e) => (
                        <Row
                          key={e.id}
                          onClick={() => go("/events")}
                          left={
                            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">
                              {e.icon}
                            </div>
                          }
                          title={e.title}
                          subtitle={`${e.date} · ${e.location}`}
                        />
                      ))}
                    </Section>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <section>
    <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
      {icon} {title}
    </p>
    <div>{children}</div>
  </section>
);

const Row = ({
  left,
  title,
  subtitle,
  onClick,
}: {
  left: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors"
  >
    {left}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
    </div>
  </button>
);

export default GlobalSearch;
