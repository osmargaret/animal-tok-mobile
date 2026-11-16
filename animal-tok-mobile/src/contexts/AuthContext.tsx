import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBaseUrl } from "@/services/api";
import { Alert } from "react-native";

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  token?: string;
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
    specialization?: string,
    password?: string
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

const PETS_KEY = "animaltok_pets";
const ACTIVE_PROFILE_KEY = "animaltok_active_profile";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);
  const [pets, setPets] = useState<ActiveProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted active profile, pets, and user from AsyncStorage
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
    persistProfile(pet);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Clean up any stale or previous session immediately
      setUser(null);
      setActiveProfile(null);
      await AsyncStorage.removeItem("animaltok_user").catch(() => {});
      await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY).catch(() => {});
      throw new Error(data.error || "Invalid credentials. Please check your username/email and password.");
    }

    if (data.user) {
      const loggedUser: MockUser = {
        id: data.user.id,
        name: data.user.name,
        username: data.user.username.startsWith("@") ? data.user.username : `@${data.user.username}`,
        email: data.user.email || email,
        avatar: data.user.avatar || (data.user.role === "vet" ? "🩺" : "🐾"),
        token: data.token,
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
    }
  };

  const signup = async (
    name: string,
    email: string,
    username: string,
    accountType: "handler" | "vet" | "business" = "handler",
    clinicName?: string,
    specialization?: string,
    password?: string
  ) => {
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const res = await fetch(`${getBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, password, accountType, clinicName, specialization }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed. Please try again.");
    }

    if (data.user) {
      const newUser: MockUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        username: data.user.username.startsWith("@") ? data.user.username : `@${data.user.username}`,
        avatar: data.user.avatar || (accountType === "vet" ? "🩺" : "🐾"),
        token: data.token,
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
    }
  };

  const logout = async () => {
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
