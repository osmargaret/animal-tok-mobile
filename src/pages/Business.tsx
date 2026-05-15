import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Wrench, Megaphone, ArrowRight, Check, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/BackButton";

const Business = () => {
  const navigate = useNavigate();
  const { signupAs } = useAuth();
  const [tab, setTab] = useState<"intro" | "signup">("intro");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !username.trim()) return;
    signupAs(name, email, username, "business", { businessName: businessName.trim() || name });
    navigate("/business/dashboard");
  };

  const inputClass =
    "w-full bg-secondary text-foreground text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <BackButton to="/feed" />
        <div className="flex items-center gap-2 flex-1">
          <Briefcase className="w-4 h-4 text-primary" />
          <h1 className="text-base font-semibold">Animandler Business</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <span className="text-5xl block mb-3">🏪</span>
          <h2 className="text-2xl font-bold">Sell on Animandler</h2>
          <p className="text-sm text-muted-foreground mt-2">
            For brands, vets, groomers and shops. Reach pet owners with products, services and ads — no pet profile required.
          </p>
        </motion.div>

        {tab === "intro" ? (
          <>
            <div className="space-y-3 mb-6">
              <Feature icon={<ShoppingBag className="w-4 h-4" />} title="List products" desc="Run your storefront and manage inventory." />
              <Feature icon={<Wrench className="w-4 h-4" />} title="Offer services" desc="Bookings for grooming, training, vet care, more." />
              <Feature icon={<Megaphone className="w-4 h-4" />} title="Boost with ads" desc="Image, video and text ads in the marketplace feed." />
            </div>
            <button
              onClick={() => setTab("signup")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Have a pet?{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-semibold">
                Use the personal sign-up
              </button>
            </p>
          </>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3 glass rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">Create your business account</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Business name</label>
              <input className={inputClass} placeholder="Acme Pet Co." value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Your name</label>
              <input className={inputClass} placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input className={inputClass} placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username</label>
              <input className={inputClass} placeholder="@yourbusiness" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
              Create business account
            </button>
            <button type="button" onClick={() => setTab("intro")} className="w-full text-xs text-muted-foreground py-1">
              Back
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
    <div className="flex-1">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-semibold">{title}</p>
        <Check className="w-3 h-3 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  </div>
);

export default Business;
