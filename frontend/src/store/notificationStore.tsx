import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "./authStore";
import { getNotificationsRequest } from "../services/notification.api";

type NotificationStoreValue = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
};

const NotificationContext = createContext<NotificationStoreValue | undefined>(undefined);

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getNotificationsRequest({ page: 1, limit: 1 });
      setUnreadCount(response.data.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    const loadUnreadCount = async () => {
      if (!user) {
        if (active) {
          setUnreadCount(0);
        }
        return;
      }

      try {
        const response = await getNotificationsRequest({ page: 1, limit: 1 });
        if (active) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    void loadUnreadCount();

    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo<NotificationStoreValue>(
    () => ({
      unreadCount,
      refreshUnreadCount,
    }),
    [refreshUnreadCount, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationStore() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationStore must be used within NotificationProvider");
  }

  return context;
}
