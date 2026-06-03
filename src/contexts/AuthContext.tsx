import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AccountType = "personal" | "business";

export interface ProfileDetails {
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatarUploaded?: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  accountType: AccountType;
  businessName?: string;
  verified?: boolean;
  verificationStatus?: "none" | "pending" | "verified";
  profile?: ProfileDetails;
}

export interface ActiveProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: "handler" | "animal" | "business";
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  activeProfile: ActiveProfile | null;
  accountType: AccountType;
  businessName?: string;
  verified: boolean;
  verificationStatus: "none" | "pending" | "verified";
  completionPercent: number;
  completionChecklist: { key: string; label: string; done: boolean }[];
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, username: string) => void;
  signupAs: (name: string, email: string, username: string, type: AccountType, opts?: { businessName?: string }) => void;
  logout: () => void;
  switchProfile: (profile: ActiveProfile) => void;
  switchToHandler: () => void;
  updateProfile: (patch: Partial<MockUser> & { profile?: ProfileDetails }) => void;
  requestVerification: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const MOCK_USER: MockUser = {
  id: "handler-1",
  name: "Alex Morgan",
  username: "@alex.morgan",
  email: "alex@example.com",
  avatar: "🐾",
  accountType: "personal",
  verified: false,
  verificationStatus: "none",
  profile: {},
};

const USER_KEY = "animaltok_user";
const PROFILE_KEY = "animaltok_active_profile";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (activeProfile) localStorage.setItem(PROFILE_KEY, JSON.stringify(activeProfile));
    else localStorage.removeItem(PROFILE_KEY);
  }, [activeProfile]);

  const handlerProfile = (u: MockUser): ActiveProfile => ({
    id: u.id,
    name: u.businessName || u.name,
    username: u.username,
    avatar: u.avatar,
    type: u.accountType === "business" ? "business" : "handler",
  });

  const login = (_email: string, _password: string) => {
    setUser(MOCK_USER);
    setActiveProfile(handlerProfile(MOCK_USER));
  };

  const signup = (name: string, email: string, username: string) => {
    const newUser: MockUser = { ...MOCK_USER, name, email, username: `@${username}`, accountType: "personal" };
    setUser(newUser);
    setActiveProfile(handlerProfile(newUser));
  };

  const signupAs: AuthContextType["signupAs"] = (name, email, username, type, opts) => {
    const newUser: MockUser = {
      ...MOCK_USER,
      id: type === "business" ? `biz-${Date.now()}` : MOCK_USER.id,
      name,
      email,
      username: `@${username}`,
      accountType: type,
      avatar: type === "business" ? "🏪" : "🐾",
      businessName: opts?.businessName,
      verified: false,
      verificationStatus: "none",
      profile: {},
    };
    setUser(newUser);
    setActiveProfile(handlerProfile(newUser));
  };

  const logout = () => {
    setUser(null);
    setActiveProfile(null);
  };

  const switchProfile = (profile: ActiveProfile) => setActiveProfile(profile);

  const switchToHandler = () => {
    if (user) setActiveProfile(handlerProfile(user));
  };

  const updateProfile: AuthContextType["updateProfile"] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        ...patch,
        profile: { ...(prev.profile || {}), ...(patch.profile || {}) },
      };
      // Sync active profile if name/avatar changed
      setActiveProfile((cur) =>
        cur && cur.id === prev.id
          ? { ...cur, name: next.businessName || next.name, avatar: next.avatar }
          : cur
      );
      return next;
    });
  };

  const requestVerification = () => {
    setUser((prev) => (prev ? { ...prev, verificationStatus: "pending" } : prev));
  };

  const { completionPercent, completionChecklist } = useMemo(() => {
    if (!user) return { completionPercent: 0, completionChecklist: [] as { key: string; label: string; done: boolean }[] };
    const p = user.profile || {};
    const items = [
      { key: "name", label: "Display name", done: !!user.name },
      { key: "username", label: "Username", done: !!user.username },
      { key: "bio", label: "Short bio", done: !!p.bio && p.bio.trim().length > 4 },
      { key: "location", label: "Location", done: !!p.location },
      { key: "phone", label: "Phone number", done: !!p.phone },
      ...(user.accountType === "business"
        ? [{ key: "website", label: "Business website", done: !!p.website }]
        : []),
    ];
    const done = items.filter((i) => i.done).length;
    return {
      completionPercent: Math.round((done / items.length) * 100),
      completionChecklist: items,
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeProfile,
        accountType: user?.accountType || "personal",
        businessName: user?.businessName,
        verified: !!user?.verified,
        verificationStatus: user?.verificationStatus || "none",
        completionPercent,
        completionChecklist,
        login,
        signup,
        signupAs,
        logout,
        switchProfile,
        switchToHandler,
        updateProfile,
        requestVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
