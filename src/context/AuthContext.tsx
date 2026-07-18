import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type PublicUser } from "../lib/api";

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: PublicUser }>("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: PublicUser }>("/auth/login", { email, password });
    setUser(res.user);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post<{ user: PublicUser }>("/auth/register", data);
    setUser(res.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await api.patch<{ user: PublicUser }>("/auth/me", data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}
