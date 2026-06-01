import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type SubscriptionPlan } from "@/contexts/EngagementContext";

const planCatalog: Record<SubscriptionPlan, { name: string; price: number; features: string[] }> = {
  starter: { name: "Starter", price: 0, features: ["Up to 5 products", "1 active ad"] },
  growth: { name: "Growth", price: 19, features: ["Unlimited products", "10 active ads", "Booking calendar"] },
  pro: { name: "Pro", price: 49, features: ["Unlimited ads", "Audience insights", "Verified badge"] },
};

const BusinessCheckout = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = (params.get("plan") || "growth") as SubscriptionPlan;
  const plan = planCatalog[planId] || planCatalog.growth;
  const { activeProfile, user, businessName } = useAuth();
  const { setSubscription } = useEngagement();
  const profileId = activeProfile?.id || user?.id || "";

  const [name, setName] = useState(businessName || user?.name || "");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [confirmed, setConfirmed] = useState<{ last4: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const last4 = useMemo(() => card.replace(/\s+/g, "").slice(-4), [card]);
  const tax = +(plan.price * 0.1).toFixed(2);
  const total = +(plan.price + tax).toFixed(2);

  const canPay =
    name.trim().length > 1 &&
    card.replace(/\s+/g, "").length >= 12 &&
    /^\d{2}\/\d{2}$/.test(exp) &&
    cvc.length >= 3;

  const pay = async () => {
    if (!canPay) return toast.error("Complete all card details");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubscription(profileId, planId, plan.price, last4 || "0000");
    setBusy(false);
    setConfirmed({ last4: last4 || "0000" });
  };

  if (confirmed) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <MobileHeader />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-xl font-bold">You're on {plan.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            ${plan.price}/mo charged to card ending {confirmed.last4}. Welcome to your upgraded business toolkit.
          </p>
          <div className="flex gap-2 mt-6 w-full max-w-xs">
            <button
              onClick={() => navigate("/business/subscriptions")}
              className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold"
            >
              View plan
            </button>
            <button
              onClick={() => navigate("/business/dashboard")}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Go to dashboard
            </button>
          </div>
        </div>
        <BusinessBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-32">
      <MobileHeader />
      <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton to="/business/subscriptions" />
        <h1 className="text-base font-semibold flex-1">Checkout</h1>
        <Lock className="w-4 h-4 text-muted-foreground" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Selected plan</p>
          </div>
          <h2 className="text-xl font-bold mt-1">{plan.name}</h2>
          <p className="text-2xl font-extrabold mt-1">
            ${plan.price}
            <span className="text-sm font-medium text-muted-foreground">/mo</span>
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="text-muted-foreground">• {f}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</p>
          <Field label="Cardholder name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none"
              placeholder="Business name"
            />
          </Field>
          <Field label="Card number">
            <div className="relative">
              <input
                inputMode="numeric"
                value={card}
                onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))}
                className="w-full bg-secondary rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none tracking-wider"
                placeholder="4242 4242 4242 4242"
              />
              <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry">
              <input
                value={exp}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                  setExp(v);
                }}
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none"
                placeholder="MM/YY"
              />
            </Field>
            <Field label="CVC">
              <input
                inputMode="numeric"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none"
                placeholder="123"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 text-sm">
          <Row label="Subtotal" value={`$${plan.price.toFixed(2)}`} />
          <Row label="Tax (10%)" value={`$${tax.toFixed(2)}`} />
          <div className="border-t border-border my-2" />
          <Row label="Total today" value={`$${total.toFixed(2)}`} bold />
        </section>

        <button
          onClick={pay}
          disabled={!canPay || busy}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
        >
          {busy ? "Processing…" : `Subscribe · $${total.toFixed(2)}/mo`}
        </button>
        <p className="text-[11px] text-center text-muted-foreground">
          <Lock className="inline w-3 h-3 mr-1" />
          Demo checkout. No real charges are made.
        </p>
      </main>

      <BusinessBottomNav />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[11px] text-muted-foreground block mb-1">{label}</span>
    {children}
  </label>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex items-center justify-between py-1 ${bold ? "font-bold text-base" : "text-muted-foreground"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default BusinessCheckout;
