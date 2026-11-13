import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { getBaseUrl } from "@/services/api";

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  accountType?: "regular" | "pending" | "business" | "vet" | "handler";
  role?: "user" | "business" | "vet" | "admin";
  clinicName?: string;
  specialization?: string;
}

export interface ActiveProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: "handler" | "animal";
  role?: string;
  clinicName?: string;
  breed?: string;
  age?: string;
  bio?: string;
  coverImage?: string;
  photos?: string[];
  photo?: string;
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  activeProfile: ActiveProfile | null;
  pets: ActiveProfile[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    username: string,
    accountType?: "handler" | "vet" | "business",
    clinicName?: string,
    specialization?: string
  ) => Promise<void>;
  updateAccountType: (type: "regular" | "business" | "vet" | "handler") => Promise<void>;
  addPet: (pet: ActiveProfile) => void;
  logout: () => Promise<void>;
  switchProfile: (profile: ActiveProfile) => void;
  switchToHandler: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const MOCK_USER: MockUser = {
  id: "user-1",
  name: "Alex Morgan",
  username: "@alex.morgan",
  email: "alex@example.com",
  avatar: "🐾",
  accountType: "regular",
};

const PETS_KEY = "animaltok_pets";
const ACTIVE_PROFILE_KEY = "animaltok_active_profile";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);
  const [pets, setPets] = useState<ActiveProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted active profile, pets, and user from AsyncStorage
    // Load persisted custom user posts into feedPosts
    AsyncStorage.getItem("animaltok_custom_posts").then((storedPosts) => {
      if (storedPosts) {
        try {
          const list = JSON.parse(storedPosts);
          if (Array.isArray(list)) {
            const { feedPosts } = require("@/data/feedData");
            list.forEach((p: any) => {
              if (!feedPosts.some((existing: any) => existing.id === p.id)) {
                feedPosts.unshift(p);
              }
            });
          }
        } catch (e) {}
      }
    }).catch(() => {});

    Promise.all([
      AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
      AsyncStorage.getItem(PETS_KEY),
      AsyncStorage.getItem("animaltok_user"),
    ]).then(([storedProfile, storedPets, storedUser]) => {
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (storedProfile) {
            try { setActiveProfile(JSON.parse(storedProfile)); } catch (e) {}
          } else {
            setActiveProfile({
              id: parsedUser.id,
              name: parsedUser.name,
              username: parsedUser.username,
              avatar: parsedUser.avatar || "🐾",
              type: "handler",
              role: parsedUser.role,
              clinicName: parsedUser.clinicName,
            });
          }
        } catch (e) {}
      }
      if (storedPets) {
        try {
          const parsed = JSON.parse(storedPets);
          if (Array.isArray(parsed)) {
            // Deduplicate pets by id and lowercase name
            const seen = new Set<string>();
            const unique = parsed.filter((p: any) => {
              const key = `${p.id || ""}_${p.name || ""}`.toLowerCase().trim();
              if (seen.has(key) || seen.has(p.name?.toLowerCase()?.trim())) return false;
              seen.add(key);
              if (p.name) seen.add(p.name.toLowerCase().trim());
              return true;
            });
            setPets(unique);
            AsyncStorage.setItem(PETS_KEY, JSON.stringify(unique)).catch(() => {});
          }
        } catch (e) {}
      }
    }).finally(() => setIsLoading(false));

    // Supabase auth state listener (if configured)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser: MockUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          username: `@${session.user.email?.split("@")[0] || "user"}`,
          email: session.user.email || "",
          avatar: "🐾",
          accountType: session.user.user_metadata?.accountType || "regular",
        };
        setUser(sbUser);
        AsyncStorage.setItem("animaltok_user", JSON.stringify(sbUser)).catch(() => {});
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const persistProfile = (profile: ActiveProfile) => {
    setActiveProfile(profile);
    AsyncStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile)).catch(() => {});
  };

  const addPet = (pet: ActiveProfile) => {
    setPets((prev) => {
      const filtered = prev.filter(
        (p) =>
          String(p.id).toLowerCase() !== String(pet.id).toLowerCase() &&
          p.name.trim().toLowerCase() !== pet.name.trim().toLowerCase()
      );
      const updated = [pet, ...filtered];
      AsyncStorage.setItem(PETS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    // Automatically switch to the new pet profile
    persistProfile(pet);
  };

  const login = async (email: string, _password: string) => {
    try {
      // 1. Try backend login first
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: _password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const loggedUser: MockUser = {
            id: data.user.id,
            name: data.user.name,
            username: data.user.username.startsWith("@") ? data.user.username : `@${data.user.username}`,
            email: data.user.email || email,
            avatar: data.user.avatar || (data.user.role === "vet" ? "🩺" : "🐾"),
            accountType: data.user.accountType || (data.user.role === "vet" ? "vet" : data.user.role === "business" ? "business" : "handler"),
            role: data.user.role || "user",
            clinicName: data.user.clinicName,
            specialization: data.user.specialization,
          };
          setUser(loggedUser);
          await AsyncStorage.setItem("animaltok_user", JSON.stringify(loggedUser));
          persistProfile({
            id: loggedUser.id,
            name: loggedUser.name,
            username: loggedUser.username,
            avatar: loggedUser.avatar,
            type: "handler",
            role: loggedUser.role,
            clinicName: loggedUser.clinicName,
          });

          if (data.animal) {
            addPet({
              id: data.animal.id,
              name: data.animal.name,
              username: data.animal.username,
              avatar: data.animal.avatar || "🐾",
              type: "animal",
              breed: data.animal.breed,
              age: data.animal.age,
              bio: data.animal.bio,
            });
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Backend auth call failed, trying Supabase fallback:", err);
    }

    try {
      // 2. Try Supabase fallback
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: _password });
      if (error) throw error;
      if (data.user) {
        const loggedUser: MockUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || email.split("@")[0],
          username: `@${email.split("@")[0]}`,
          email: email,
          avatar: "🐾",
          accountType: data.user.user_metadata?.accountType || "regular",
        };
        setUser(loggedUser);
        await AsyncStorage.setItem("animaltok_user", JSON.stringify(loggedUser));
        persistProfile({
          id: loggedUser.id,
          name: loggedUser.name,
          username: loggedUser.username,
          avatar: loggedUser.avatar,
          type: "handler",
        });
      }
    } catch (e) {
      // 3. Fallback demo user
      setUser(MOCK_USER);
      persistProfile({
        id: MOCK_USER.id,
        name: MOCK_USER.name,
        username: MOCK_USER.username,
        avatar: MOCK_USER.avatar,
        type: "handler",
      });
    }
  };

  const signup = async (
    name: string,
    email: string,
    username: string,
    accountType: "handler" | "vet" | "business" = "handler",
    clinicName?: string,
    specialization?: string
  ) => {
    try {
      // Register with the Express backend & Neon Postgres
      const res = await fetch(`${getBaseUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, accountType, clinicName, specialization }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const newUser: MockUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            username: data.user.username.startsWith("@") ? data.user.username : `@${data.user.username}`,
            avatar: data.user.avatar || (accountType === "vet" ? "🩺" : "🐾"),
            accountType: data.user.accountType || accountType,
            role: data.user.role || (accountType === "vet" ? "vet" : accountType === "business" ? "business" : "user"),
            clinicName: data.user.clinicName || clinicName,
            specialization: data.user.specialization || specialization,
          };
          setUser(newUser);
          await AsyncStorage.setItem("animaltok_user", JSON.stringify(newUser));
          persistProfile({
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            avatar: newUser.avatar,
            type: "handler",
            role: newUser.role,
            clinicName: newUser.clinicName,
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Backend registration failed, using local registration:", err);
    }

    const newUser: MockUser = {
      ...MOCK_USER,
      id: `u_${Date.now()}`,
      name,
      email,
      username: `@${username}`,
      accountType: accountType,
      role: accountType === "vet" ? "vet" : accountType === "business" ? "business" : "user",
      clinicName,
      specialization,
      avatar: accountType === "vet" ? "🩺" : "🐾",
    };
    setUser(newUser);
    await AsyncStorage.setItem("animaltok_user", JSON.stringify(newUser));
    persistProfile({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      avatar: newUser.avatar,
      type: "handler",
      role: newUser.role,
      clinicName: newUser.clinicName,
    });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
    } catch (e) {}
    setUser(null);
    setActiveProfile(null);
    setPets([]);
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY).catch(() => {});
    await AsyncStorage.removeItem("animaltok_user").catch(() => {});
    await AsyncStorage.removeItem(PETS_KEY).catch(() => {});
  };

  const updateAccountType = async (type: "regular" | "business" | "vet" | "handler") => {
    if (user) {
      const updatedUser = { ...user, accountType: type };
      setUser(updatedUser);
      await AsyncStorage.setItem("animaltok_user", JSON.stringify(updatedUser)).catch(() => {});
    }
  };

  const switchProfile = (profile: ActiveProfile) => {
    persistProfile(profile);
  };

  const switchToHandler = () => {
    if (user) {
      persistProfile({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        type: "handler",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeProfile,
        pets,
        isLoading,
        login,
        signup,
        updateAccountType,
        addPet,
        logout,
        switchProfile,
        switchToHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
