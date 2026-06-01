import { Check, Sparkles, BadgeCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagement, type SubscriptionPlan } from "@/contexts/EngagementContext";
import { toast } from "sonner";

type Plan = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceLabel: string;
  tagline: string;
  features: string[];
  highlight: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    tagline: "Get going with the basics",
    features: ["Up to 5 products", "1 active ad", "Standard support"],
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 19,
    priceLabel: "$19/mo",
    tagline: "For growing businesses",
    features: ["Unlimited products", "10 active ads", "Booking calendar", "Priority support"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "$49/mo",
    tagline: "Maximum reach & analytics",
    features: ["Everything in Growth", "Unlimited ads", "Audience insights", "Verified badge"],
    highlight: false,
  },
];

const BusinessSubscriptions = () => {
  const navigate = useNavigate();
  const { activeProfile, user } = useAuth();
  const { subscriptionFor, setSubscription, cancelSubscription } = useEngagement();
  const profileId = activeProfile?.id || user?.id || "";
  const current = subscriptionFor(profileId);

  const select = (p: Plan) => {
    if (p.price === 0) {
      setSubscription(profileId, p.id, 0, "FREE");
      toast.success("Starter plan activated");
      return;
    }
    navigate(`/business/checkout?plan=${p.id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <MobileHeader />
      <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton to="/business/dashboard" />
        <h1 className="text-base font-semibold flex-1">Subscriptions</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {current && current.status === "active" && (
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-4 flex items-center gap-3">
            <BadgeCheck className="w-6 h-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Current plan</p>
              <p className="text-sm font-bold capitalize">
                {current.plan} · ${current.price}/mo
              </p>
              <p className="text-[11px] text-muted-foreground">
                Renews {new Date(current.renewsAt).toLocaleDateString()} · card ending {current.paymentLast4}
              </p>
            </div>
            {current.plan !== "starter" && (
              <button
                onClick={() => {
                  cancelSubscription(profileId);
                  toast.success("Subscription cancelled");
                }}
                className="p-2 rounded-full border border-border hover:bg-secondary"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </section>
        )}

        {plans.map((p) => {
          const isCurrent = current?.plan === p.id && current.status === "active";
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 transition-all ${
                p.highlight ? "border-primary bg-gradient-to-br from-primary/10 to-accent/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{p.name}</h3>
                    {p.highlight && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                </div>
                <span className="text-lg font-bold">{p.priceLabel}</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && select(p)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isCurrent
                    ? "bg-secondary text-muted-foreground cursor-default"
                    : p.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {isCurrent ? "Current plan" : p.price === 0 ? "Use Starter" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </main>

      <BusinessBottomNav />
    </div>
  );
};

export default BusinessSubscriptions;
