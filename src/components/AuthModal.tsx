import { useState } from "react";
import { X, ChevronLeft, Check, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "auth" | "addPet" | "addBusiness" | "subscription";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<Step>("auth");
  const [petSkipped, setPetSkipped] = useState(false);

  const handleSignupSuccess = () => {
    setStep("addPet");
  };

  const handleLoginSuccess = () => {
    onClose();
    resetState();
  };

  const handlePetDone = () => {
    setPetSkipped(false);
    setStep("addBusiness");
  };

  const handlePetSkip = () => {
    setPetSkipped(true);
    setStep("addBusiness");
  };

  const handleBusinessDone = () => {
    setStep("subscription");
  };

  const handleBusinessSkip = () => {
    onClose();
    resetState();
  };

  const handleSubscriptionDone = () => {
    onClose();
    resetState();
  };

  const resetState = () => {
    setStep("auth");
    setTab("login");
    setPetSkipped(false);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 m-auto z-50 glass rounded-2xl border border-border max-w-md max-h-[90vh] overflow-y-auto"
            style={{ height: "fit-content" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {step !== "auth" && (
                  <button onClick={() => setStep(step === "addBusiness" ? "addPet" : step === "subscription" ? "addBusiness" : "auth")}>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <h2 className="text-lg font-bold text-foreground">
                  {step === "auth" && "Welcome to AnimalTok"}
                  {step === "addPet" && "Add a Pet"}
                  {step === "addBusiness" && "Add a Business"}
                  {step === "subscription" && "Choose a Plan"}
                </h2>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-4">
              {step === "auth" && (
                <>
                  {/* Step indicator */}
                  <StepIndicator current={0} />

                  <div className="flex rounded-lg bg-secondary p-1 mb-5">
                    <button
                      onClick={() => setTab("login")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                        tab === "login" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
                      }`}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => setTab("signup")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                        tab === "signup" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
                      }`}
                    >
                      Create account
                    </button>
                  </div>

                  {tab === "login" ? (
                    <LoginForm onSuccess={handleLoginSuccess} />
                  ) : (
                    <SignupForm onSuccess={handleSignupSuccess} />
                  )}
                </>
              )}

              {step === "addPet" && (
                <>
                  <StepIndicator current={1} />
                  <AddPetForm onDone={handlePetDone} onSkip={handlePetSkip} />
                </>
              )}

              {step === "addBusiness" && (
                <>
                  <StepIndicator current={2} />
                  <AddBusinessForm onDone={handleBusinessDone} onSkip={petSkipped ? undefined : handleBusinessSkip} />
                </>
              )}

              {step === "subscription" && (
                <>
                  <StepIndicator current={3} />
                  <SubscriptionForm onDone={handleSubscriptionDone} />
                </>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center px-5 py-4">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const StepIndicator = ({ current }: { current: number }) => {
  const steps = ["Account", "Pet", "Business", "Plan"];
  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            i < current ? "bg-primary text-primary-foreground" : i === current ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <span className={`text-[10px] ${i === current ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`w-4 h-px ${i < current ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
};

const inputClass =
  "w-full bg-secondary text-foreground text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary";

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-2">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Email or username</label>
        <input className={inputClass} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Password</label>
        <input type="password" className={inputClass} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
        Log in
      </button>
    </form>
  );
};

const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name, email, username);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-2">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
        <input className={inputClass} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
        <input className={inputClass} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Username</label>
        <input className={inputClass} placeholder="@username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Password</label>
        <input type="password" className={inputClass} placeholder="••••••••" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Confirm password</label>
        <input type="password" className={inputClass} placeholder="••••••••" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Country</label>
          <select className={inputClass}>
            <option>United States</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone (optional)</label>
          <input className={inputClass} placeholder="+1 555..." />
        </div>
      </div>
      <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
        Create account
      </button>
    </form>
  );
};

const AddPetForm = ({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  return (
    <div className="space-y-3 pb-2">
      <p className="text-xs text-muted-foreground mb-2">Add your first pet to get started. You can add more later.</p>

      {/* Image upload placeholder */}
      <div className="flex justify-center mb-2">
        <button className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors">
          <Camera className="w-5 h-5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Photo</span>
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Pet name</label>
        <input className={inputClass} placeholder="e.g. Bella" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
          <select className={inputClass} value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Age / DOB</label>
          <input className={inputClass} placeholder="e.g. 3 years" value={age} onChange={e => setAge(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onSkip} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors">
          Skip
        </button>
        <button onClick={onDone} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
          Add Pet
        </button>
      </div>
    </div>
  );
};

const AddBusinessForm = ({ onDone, onSkip }: { onDone: () => void; onSkip?: () => void }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="space-y-3 pb-2">
      <p className="text-xs text-muted-foreground mb-2">
        Set up your business to sell products or offer services.
        {!onSkip && <span className="text-destructive font-medium"> (Required — you skipped adding a pet)</span>}
      </p>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Business name</label>
        <input className={inputClass} placeholder="e.g. PawShop" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Business type</label>
        <select className={inputClass} value={type} onChange={e => setType(e.target.value)}>
          <option value="">Select type</option>
          <option>Store</option>
          <option>Service</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Location</label>
        <input className={inputClass} placeholder="e.g. New York, NY" value={location} onChange={e => setLocation(e.target.value)} />
      </div>

      <div className="flex gap-2 pt-1">
        {onSkip && (
          <button onClick={onSkip} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors">
            Skip
          </button>
        )}
        <button onClick={onDone} className={`${onSkip ? "flex-1" : "w-full"} py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors`}>
          Add Business
        </button>
      </div>
    </div>
  );
};

const SubscriptionForm = ({ onDone }: { onDone: () => void }) => {
  const [selected, setSelected] = useState("free");

  const plans = [
    { id: "free", name: "Free", products: "5 Products", price: "$0", priceDetail: "Forever free" },
    { id: "basic", name: "Basic", products: "20 Products", price: "$2/mo", priceDetail: "$20/year" },
    { id: "enterprise", name: "Enterprise", products: "100 Products", price: "$8/mo", priceDetail: "$80/year" },
  ];

  return (
    <div className="space-y-3 pb-2">
      <p className="text-xs text-muted-foreground mb-2">Choose a plan for your business store.</p>

      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => setSelected(plan.id)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
            selected === plan.id ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected === plan.id ? "border-primary" : "border-muted-foreground"
          }`}>
            {selected === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{plan.name}</span>
              <span className="text-sm font-bold text-primary">{plan.price}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-muted-foreground">{plan.products}</span>
              <span className="text-[11px] text-muted-foreground">{plan.priceDetail}</span>
            </div>
          </div>
        </button>
      ))}

      <button onClick={onDone} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mt-2">
        {selected === "free" ? "Start Free" : "Subscribe & Continue"}
      </button>
    </div>
  );
};

export default AuthModal;
