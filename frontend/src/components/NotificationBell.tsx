import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import NotificationDropdown from "./NotificationDropdown";
import type { NotificationItem } from "../types/notification";
import {
  deleteNotificationRequest,
  getNotificationsRequest,
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
} from "../services/notification.api";
import { useNotificationStore } from "../store/notificationStore";

type NotificationBellProps = {
  buttonClassName?: string;
  iconClassName?: string;
};

export default function NotificationBell({
  buttonClassName,
  iconClassName,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { unreadCount, refreshUnreadCount } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await getNotificationsRequest({ page: 1, limit: 6 });
        setNotifications(response.data.items);
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotifications();
  }, [isOpen]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationAsReadRequest(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      );
      void refreshUnreadCount();
    } catch {
      // keep the menu responsive even if the update fails
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotificationRequest(id);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
      void refreshUnreadCount();
    } catch {
      // keep silent; the page will refresh from the server later
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadRequest();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      void refreshUnreadCount();
    } catch {
      // no-op
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className={buttonClassName || "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce8f4] bg-white text-[#0b2b53] shadow-sm transition hover:bg-[#f2f8ff]"}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <BellIcon className={iconClassName || "h-5 w-5"} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
