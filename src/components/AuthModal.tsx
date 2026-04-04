import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 m-auto z-50 glass rounded-2xl border border-border max-w-md max-h-[90vh] overflow-y-auto"
            style={{ height: "fit-content" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Welcome to AnimalTok</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-4">
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

              {tab === "login" ? <LoginForm onSuccess={onClose} /> : <SignupForm onSuccess={onClose} />}
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

export default AuthModal;
