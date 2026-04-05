import { createContext, useContext, useState, type ReactNode } from "react";

export interface MockUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
}

export interface ActiveProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: "handler" | "animal";
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  activeProfile: ActiveProfile | null;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, username: string) => void;
  logout: () => void;
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
  id: "1",
  name: "Alex Morgan",
  username: "@alex.morgan",
  email: "alex@example.com",
  avatar: "🐾",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);

  const login = (_email: string, _password: string) => {
    setUser(MOCK_USER);
    setActiveProfile({
      id: MOCK_USER.id,
      name: MOCK_USER.name,
      username: MOCK_USER.username,
      avatar: MOCK_USER.avatar,
      type: "handler",
    });
  };

  const signup = (name: string, email: string, username: string) => {
    const newUser = { ...MOCK_USER, name, email, username: `@${username}` };
    setUser(newUser);
    setActiveProfile({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      avatar: newUser.avatar,
      type: "handler",
    });
  };

  const logout = () => {
    setUser(null);
    setActiveProfile(null);
  };

  const switchProfile = (profile: ActiveProfile) => {
    setActiveProfile(profile);
  };

  const switchToHandler = () => {
    if (user) {
      setActiveProfile({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        type: "handler",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, activeProfile, login, signup, logout, switchProfile, switchToHandler }}>
      {children}
    </AuthContext.Provider>
  );
};
