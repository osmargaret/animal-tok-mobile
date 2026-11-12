import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Landing = () => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const { login, signup } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupCountry, setSignupCountry] = useState("United States");
  const [signupPhone, setSignupPhone] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPassword);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(signupName, signupEmail, signupUsername);
  };

  const inputClass =
    "w-full bg-secondary text-foreground text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-3 block">🐾</span>
          <h1 className="text-2xl font-bold text-foreground">AnimalTok</h1>
          <p className="text-sm text-muted-foreground mt-1">Your pet community awaits</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border p-5">
          {/* Tabs */}
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
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email or username</label>
                <input
                  className={inputClass}
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Log in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
                <input className={inputClass} placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <input className={inputClass} placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                <input className={inputClass} placeholder="@username" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Password</label>
                <input type="password" className={inputClass} placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Confirm password</label>
                <input type="password" className={inputClass} placeholder="••••••••" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                  <select className={inputClass} value={signupCountry} onChange={(e) => setSignupCountry(e.target.value)}>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone (optional)</label>
                  <input className={inputClass} placeholder="+1 555..." value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Create account
              </button>
            </form>
          )}

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
