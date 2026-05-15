import { useState } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Star, Edit2, Trash2, Info } from "lucide-react";
import BackButton from "@/components/BackButton";

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  emoji: string;
  featured: boolean;
}

const initialProducts: Product[] = [
  { id: 1, name: "Dog Collar", price: "$12.99", stock: 15, emoji: "🦮", featured: true },
  { id: 2, name: "Pet Bowl", price: "$8.50", stock: 8, emoji: "🥣", featured: false },
  { id: 3, name: "Dog Food (5kg)", price: "$24.99", stock: 6, emoji: "🦴", featured: true },
  { id: 4, name: "Cat Toy", price: "$3.99", stock: 22, emoji: "🧶", featured: false },
  { id: 5, name: "Pet Bed", price: "$34.50", stock: 3, emoji: "🛏️", featured: true },
];

const MyStore = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleFeatured = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <DesktopSidebar onEventsOpen={() => {}} />
      <MobileHeader />

      <main className="h-full lg:ml-60 overflow-y-auto pb-20 lg:pb-0">
        <div className="lg:hidden flex items-center gap-3 px-5 pt-[max(3.75rem,calc(env(safe-area-inset-top)+3.25rem))]">
          <BackButton />
        </div>
        {/* Store Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-3xl border-2 border-primary/30 shadow-lg shadow-primary/10">
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground">{user?.name || "Alex"}'s Pet Shop</h1>
              <p className="text-sm text-muted-foreground">{user?.username || "@alex.handler"}</p>
              <div className="flex gap-4 mt-1.5">
                <span className="text-xs"><span className="font-bold text-foreground">24</span> <span className="text-muted-foreground">Products</span></span>
                <span className="text-xs"><span className="font-bold text-foreground">187</span> <span className="text-muted-foreground">Sold</span></span>
                <span className="text-xs"><span className="font-bold text-foreground">2.1K</span> <span className="text-muted-foreground">Followers</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-5 mb-3">
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All products are shown in the marketplace. Click "Feature" to promote a product.
            </p>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="px-5 mb-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add new product
          </button>
        </div>

        {/* Product List */}
        <div className="px-5 flex flex-col gap-3 pb-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-2xl border border-border shrink-0">
                {product.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm font-bold text-primary">{product.price}</p>
                <p className="text-[11px] text-muted-foreground">In stock: {product.stock}</p>

                <div className="mt-1.5">
                  {product.featured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">★ Not featured</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => toggleFeatured(product.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    product.featured
                      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  {product.featured ? "Unfeature" : "Feature"}
                </button>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Edit2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyStore;
