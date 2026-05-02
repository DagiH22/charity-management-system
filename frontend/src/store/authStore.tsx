import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { clearAuthToken, getAuthToken, meRequest, setAuthToken } from "../services/auth.api";

type AuthStoreValue = {
  user: User | null;
  isBootstrapping: boolean;
  setAuthSession: (token: string, nextUser: User) => void;
  logout: () => void;
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
      const token = getAuthToken();

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await meRequest(token);
        setUser(response.user);
      } catch {
        clearAuthToken();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const setAuthSession = useCallback((token: string, nextUser: User) => {
    setAuthToken(token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
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