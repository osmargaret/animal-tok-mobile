import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CheckCircle2, Package, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type Order } from "@/contexts/EngagementContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { activeProfile, isAuthenticated } = useAuth();
  const { cartItemsFor, updateCartQty, removeFromCart, cartSubtotal, placeOrder } = useEngagement();
  const profileId = activeProfile?.id || "";
  const items = profileId ? cartItemsFor(profileId) : [];
  const subtotal = profileId ? cartSubtotal(profileId) : 0;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const [step, setStep] = useState<"cart" | "details" | "done">("cart");
  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [name, setName] = useState(activeProfile?.name || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [card, setCard] = useState("");

  const last4 = useMemo(() => card.replace(/\D/g, "").slice(-4), [card]);

  if (!isAuthenticated || !activeProfile) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-base font-semibold">Sign in to view your cart</p>
          <button onClick={() => navigate("/feed")} className="mt-3 text-primary text-sm">Back</button>
        </div>
      </div>
    );
  }

  const handlePlace = () => {
    if (!name.trim() || !address.trim() || !city.trim()) return toast.error("Fill in shipping details");
    if (last4.length !== 4) return toast.error("Enter a valid card number");
    const order = placeOrder(profileId, {
      shippingName: name.trim(),
      shippingAddress: address.trim(),
      shippingCity: city.trim(),
      paymentLast4: last4,
    });
    if (!order) return toast.error("Your cart is empty");
    setConfirmed(order);
    setStep("done");
    toast.success("Order placed");
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-32">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={() => (step === "details" ? setStep("cart") : navigate(-1))} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">
            {step === "cart" && "Your Cart"}
            {step === "details" && "Checkout"}
            {step === "done" && "Order Confirmed"}
          </h1>
          <p className="text-[11px] text-muted-foreground">As {activeProfile.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {step === "cart" && (
          items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add products from the marketplace</p>
              <button onClick={() => navigate("/marketplace")} className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                Browse marketplace
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
                    <img src={it.image} alt={it.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{it.name}</p>
                      <p className="text-sm text-primary font-bold mt-0.5">${it.price.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-secondary rounded-lg px-1">
                          <button onClick={() => updateCartQty(it.id, it.qty - 1)} className="p-1.5"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-xs font-semibold w-5 text-center">{it.qty}</span>
                          <button onClick={() => updateCartQty(it.id, it.qty + 1)} className="p-1.5"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <button onClick={() => removeFromCart(it.id)} className="p-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Summary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
              <button onClick={() => setStep("details")} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                Continue to checkout
              </button>
            </>
          )
        )}

        {step === "details" && (
          <>
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Package className="w-4 h-4 text-primary" /> Shipping
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, ZIP" className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="w-4 h-4 text-primary" /> Payment
              </div>
              <input
                value={card}
                onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))}
                placeholder="Card number"
                inputMode="numeric"
                className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary tracking-widest"
              />
              <p className="text-[11px] text-muted-foreground">Demo checkout — no card is actually charged.</p>
            </div>

            <Summary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
            <button onClick={handlePlace} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              Place order · ${total.toFixed(2)}
            </button>
          </>
        )}

        {step === "done" && confirmed && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <p className="text-base font-bold">Thanks, {activeProfile.name}!</p>
              <p className="text-xs text-muted-foreground mt-1">Order #{confirmed.id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Items</p>
              {confirmed.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1">{it.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty {it.qty}</p>
                  </div>
                  <p className="text-sm font-semibold">${(it.price * it.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-card border border-border p-4 text-xs space-y-1">
              <p className="font-semibold text-muted-foreground mb-1">Shipping to</p>
              <p>{confirmed.shippingName}</p>
              <p className="text-muted-foreground">{confirmed.shippingAddress}, {confirmed.shippingCity}</p>
              <p className="text-muted-foreground mt-2">Paid with card ending in •••• {confirmed.paymentLast4}</p>
            </div>

            <Summary subtotal={confirmed.subtotal} shipping={confirmed.shipping} tax={confirmed.tax} total={confirmed.total} />

            <div className="flex gap-2">
              <button onClick={() => navigate("/marketplace")} className="flex-1 py-3 rounded-xl bg-secondary font-semibold text-sm">
                Keep shopping
              </button>
              <button onClick={() => navigate("/feed")} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Summary = ({ subtotal, shipping, tax, total }: { subtotal: number; shipping: number; tax: number; total: number }) => (
  <div className="rounded-xl bg-card border border-border p-4 text-sm space-y-1.5">
    <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
    <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
    <Row label="Tax" value={`$${tax.toFixed(2)}`} />
    <div className="border-t border-border pt-2 mt-1">
      <Row label={<span className="font-bold">Total</span>} value={<span className="font-bold text-primary">${total.toFixed(2)}</span>} />
    </div>
  </div>
);

const Row = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>
);

export default Checkout;
