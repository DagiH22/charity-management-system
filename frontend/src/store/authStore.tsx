import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { logoutRequest, meRequest } from "../services/auth.api";

type AuthStoreValue = {
  user: User | null;
  isBootstrapping: boolean;
  setAuthSession: (nextUser: User) => void;
  logout: () => Promise<void>;
  completeCharityProfile: () => void;
};

const AuthContext = createContext<AuthStoreValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await meRequest();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const setAuthSession = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const completeCharityProfile = useCallback(() => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        hasCharityProfile: true,
      };
    });
  }, []);

  const value = useMemo<AuthStoreValue>(
    () => ({
      user,
      isBootstrapping,
      setAuthSession,
      logout,
      completeCharityProfile,
    }),
    [completeCharityProfile, isBootstrapping, logout, setAuthSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthStore() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthStore must be used within AuthProvider");
  }

  return context;
}