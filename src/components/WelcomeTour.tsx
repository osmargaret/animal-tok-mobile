import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Home, PlusSquare, Users, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "animaltok_welcome_tour_seen";

const steps = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Welcome to AnimalTok 🐾",
    body: "Your feed learns what you love. Swipe up for more, double-tap to heart, and hold to save.",
    cta: "Next",
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: "For You & Following",
    body: "Two feeds — one curated for discovery, one for the pets and creators you follow.",
    cta: "Next",
  },
  {
    icon: <PlusSquare className="w-6 h-6" />,
    title: "Post your first moment",
    body: "Photos, videos, or just a thought — share from your handler profile or any pet.",
    cta: "Next",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Follow a few pets",
    body: "Explore trending animals and give a few a follow to fill up your Following feed.",
    cta: "Next",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Shop, book & connect",
    body: "Marketplace, services, events and messaging live one tap away in the bottom bar.",
    cta: "Get started",
  },
];

const WelcomeTour = () => {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    try {
      const seen = localStorage.getItem(`${STORAGE_KEY}:${user.id}`);
      if (!seen) setOpen(true);
    } catch {}
  }, [isAuthenticated, user]);

  const close = () => {
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY}:${user.id}`, "1");
      } catch {}
    }
    setOpen(false);
  };

  const next = () => {
    if (step >= steps.length - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
  };

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] max-w-sm mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
            role="dialog"
            aria-label="Welcome tour"
          >
            <div className="relative">
              <div className="h-1 w-full bg-secondary">
                <motion.div className="h-full bg-primary" initial={false} animate={{ width: `${progress}%` }} />
              </div>
              <button onClick={close} className="absolute top-3 right-3 p-1.5 rounded-full bg-background/70 hover:bg-secondary" aria-label="Close tour">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 pt-6 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                {current.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{current.body}</p>

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-1.5" aria-hidden>
                  {steps.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-secondary"}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {step < steps.length - 1 && (
                    <button onClick={close} className="text-xs font-semibold text-muted-foreground px-3 py-2 hover:text-foreground">
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (step === steps.length - 1) {
                        close();
                        navigate("/explore");
                      } else next();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                  >
                    {current.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeTour;
