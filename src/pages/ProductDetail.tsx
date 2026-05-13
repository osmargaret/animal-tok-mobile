import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, MapPin, MessageCircle, ChevronRight, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement } from "@/contexts/EngagementContext";
import { toast } from "sonner";

const allProducts = [
  { id: 1, name: "Premium Dog Food", price: 24.99, seller: "PetNutrition Co", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=600&fit=crop", category: "Food", description: "High-quality, grain-free dog food made with real chicken and vegetables. Perfect for dogs of all ages and breeds. Rich in protein and essential nutrients.", inStock: true, sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", sellerRating: 4.9, sellerProducts: 45, images: ["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&h=600&fit=crop"] },
  { id: 2, name: "Cat Climbing Tower", price: 89.99, seller: "CatWorld", rating: 4.6, reviews: 87, image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&h=600&fit=crop", category: "Accessories", description: "Multi-level cat tower with scratching posts, cozy hideaways, and dangling toys. Sturdy construction supports cats up to 20 lbs.", inStock: true, sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", sellerRating: 4.7, sellerProducts: 32, images: ["https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&h=600&fit=crop"] },
  { id: 3, name: "Pet GPS Tracker", price: 49.99, seller: "TechPets", rating: 4.9, reviews: 203, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop", category: "Tech", description: "Real-time GPS tracking for your pet. Waterproof, lightweight collar attachment with up to 7 days battery life. Works with iOS and Android.", inStock: true, sellerAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop", sellerRating: 4.8, sellerProducts: 18, images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop"] },
  { id: 4, name: "Organic Bird Seeds", price: 12.99, seller: "BirdLover", rating: 4.5, reviews: 56, image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=600&fit=crop", category: "Food", description: "100% organic seed mix for parrots, cockatiels, and finches. No artificial preservatives or colors.", inStock: false, sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", sellerRating: 4.6, sellerProducts: 12, images: ["https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=600&fit=crop"] },
  { id: 5, name: "Dog Leash Set", price: 19.99, seller: "WalkTime", rating: 4.7, reviews: 145, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop", category: "Accessories", description: "Durable nylon leash and collar set with reflective stitching. Adjustable collar fits necks 12-20 inches.", inStock: true, sellerAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop", sellerRating: 4.5, sellerProducts: 28, images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop"] },
  { id: 6, name: "Aquarium Filter", price: 34.99, seller: "AquaWorld", rating: 4.4, reviews: 78, image: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=600&h=600&fit=crop", category: "Equipment", description: "Quiet, efficient aquarium filter suitable for tanks up to 50 gallons. Easy to install and maintain.", inStock: true, sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", sellerRating: 4.3, sellerProducts: 22, images: ["https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=600&h=600&fit=crop"] },
];

const reviewsData = [
  { id: 1, user: "Sarah M.", avatar: "🐕", rating: 5, text: "My dog absolutely loves this! Great quality and fast shipping.", time: "2 days ago" },
  { id: 2, user: "Mike T.", avatar: "🐈", rating: 4, text: "Good product, exactly as described. Would buy again.", time: "1 week ago" },
  { id: 3, user: "Lisa K.", avatar: "🐦", rating: 5, text: "Excellent! My pets are very happy with this purchase.", time: "2 weeks ago" },
];

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, activeProfile } = useAuth();
  const { addToCart, cartCount } = useEngagement();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const profileId = activeProfile?.id || "";
  const inCart = profileId ? cartCount(profileId) : 0;

  const handleAddToCart = () => {
    if (!isAuthenticated || !activeProfile) {
      toast.error("Sign in to add to cart");
      return;
    }
    addToCart(activeProfile.id, {
      productId: product!.id,
      name: product!.name,
      price: product!.price,
      qty,
      image: product!.image,
    });
    toast.success(`${product!.name} added to cart (${qty})`);
  };

  const product = allProducts.find((p) => p.id === Number(productId));

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Product not found</p>
          <button onClick={() => navigate("/marketplace")} className="mt-3 text-primary text-sm">Back to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold truncate mx-4">Product Details</h1>
          <button onClick={() => setLiked(!liked)} className="p-1.5 rounded-full hover:bg-secondary">
            <Heart className={`w-5 h-5 ${liked ? "fill-[hsl(var(--like))] text-[hsl(var(--like))]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <img src={product.images[activeImage]} alt={product.name} className="w-full aspect-square object-cover" />
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? "bg-primary" : "bg-foreground/40"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Title & Price */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{product.category}</span>
            {product.inStock ? (
              <span className="text-xs text-green-400">In Stock</span>
            ) : (
              <span className="text-xs text-[hsl(var(--like))]">Out of Stock</span>
            )}
          </div>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <p className="text-2xl font-bold text-primary mt-2">${product.price.toFixed(2)}</p>
        </div>

        {/* Quantity */}
        {product.inStock && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-3 bg-secondary rounded-lg px-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="w-4 h-4" /></button>
              <span className="text-sm font-semibold w-6 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Truck, label: "Free Shipping" },
            { icon: Shield, label: "Secure Pay" },
            { icon: RotateCcw, label: "Easy Returns" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary text-center">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Seller */}
        <button onClick={() => {}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <img src={product.sellerAvatar} alt={product.seller} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">{product.seller}</p>
            <p className="text-xs text-muted-foreground">{product.sellerProducts} products · ⭐ {product.sellerRating}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Reviews */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Reviews</h3>
          <div className="space-y-3">
            {reviewsData.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.avatar}</span>
                    <span className="text-sm font-medium">{r.user}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {product.inStock && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 lg:bottom-0">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors relative">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart · ${(product.price * qty).toFixed(2)}
              {inCart > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {inCart}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProductDetail;
