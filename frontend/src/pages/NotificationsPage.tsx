import { useEffect, useState } from "react";
import {
  deleteNotificationRequest,
  getNotificationsRequest,
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
} from "../services/notification.api";
import { getApiErrorMessage } from "../services/apiErrors";
import type { NotificationItem } from "../types/notification";
import { useNotificationStore } from "../store/notificationStore";

const PAGE_SIZE = 10;

const formatTime = (value: string) =>
  new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const { refreshUnreadCount } = useNotificationStore();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getNotificationsRequest({ page, limit: PAGE_SIZE });
        setItems(response.data.items);
        setUnreadCount(response.data.unreadCount);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotifications();
  }, [page]);

  const reloadPage = async () => {
    const response = await getNotificationsRequest({ page, limit: PAGE_SIZE });
    setItems(response.data.items);
    setUnreadCount(response.data.unreadCount);
    setTotalPages(response.data.totalPages);
    void refreshUnreadCount();
  };

  const handleMarkRead = async (id: number) => {
    try {
      setActionLoadingId(id);
      setActionError(null);
      await markNotificationAsReadRequest(id);
      await reloadPage();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoadingId(id);
      setActionError(null);
      await deleteNotificationRequest(id);
      await reloadPage();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAllRead(true);
      setActionError(null);
      await markAllNotificationsAsReadRequest();
      await reloadPage();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const pageButtons = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );

  return (
    <div className="mx-auto max-w-[1200px] py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
            Notifications
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Track donation alerts, campaign updates, and account activity.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Unread
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#0b2b53]">
            {unreadCount}
          </p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void handleMarkAllRead();
            }}
            disabled={isMarkingAllRead || unreadCount === 0}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMarkingAllRead ? "Marking..." : "Mark all as read"}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading notifications...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0b2b53]">No notifications yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Activity from donations, campaigns, and account updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-3xl border p-5 shadow-sm transition ${
                notification.isRead
                  ? "border-slate-200 bg-white"
                  : "border-emerald-200 bg-emerald-50/60"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        notification.isRead ? "bg-slate-300" : "bg-emerald-500"
                      }`}
                    />
                    <h2 className="truncate text-lg font-bold text-[#0b2b53]">
                      {notification.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{formatTime(notification.createdAt)}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-wider text-slate-500">
                      {notification.type}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {!notification.isRead && (
                    <button
                      type="button"
                      disabled={actionLoadingId === notification.id}
                      onClick={() => {
                        void handleMarkRead(notification.id);
                      }}
                      className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionLoadingId === notification.id ? "Working..." : "Mark read"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoadingId === notification.id}
                    onClick={() => {
                      void handleDelete(notification.id);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {pageButtons.map((itemPage) => (
            <button
              key={itemPage}
              type="button"
              onClick={() => setPage(itemPage)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                itemPage === page
                  ? "bg-[#0b2b53] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {itemPage}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
