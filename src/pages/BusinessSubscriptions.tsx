import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import MobileHeader from "@/components/MobileHeader";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    tagline: "Get going with the basics",
    features: ["Up to 5 products", "1 active ad", "Standard support"],
    cta: "Current plan",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$19/mo",
    tagline: "For growing businesses",
    features: ["Unlimited products", "10 active ads", "Booking calendar", "Priority support"],
    cta: "Upgrade",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49/mo",
    tagline: "Maximum reach & analytics",
    features: ["Everything in Growth", "Unlimited ads", "Audience insights", "Verified badge"],
    cta: "Go Pro",
    highlight: false,
  },
];

const BusinessSubscriptions = () => (
  <div className="min-h-[100dvh] bg-background text-foreground pb-24">
    <MobileHeader />
    <header className="sticky top-[3.5rem] lg:top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
      <BackButton to="/business/dashboard" />
      <h1 className="text-base font-semibold flex-1">Subscriptions</h1>
    </header>

    <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
      {plans.map((p) => (
        <div
          key={p.id}
          className={`rounded-2xl border p-5 ${p.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}
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
            <span className="text-lg font-bold">{p.price}</span>
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
            onClick={() => toast.success(`${p.name} plan selected (demo)`)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              p.highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {p.cta}
          </button>
        </div>
      ))}
    </main>

    <BusinessBottomNav />
  </div>
);

export default BusinessSubscriptions;
