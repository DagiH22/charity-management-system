import { Link } from "react-router-dom";
import {
  CheckIcon,
  InboxIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { NotificationItem } from "../types/notification";

type NotificationDropdownProps = {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkRead: (id: number) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
  onMarkAllRead?: () => void;
  dropdownClassName?: string;
};

const formatTime = (value: string) => {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationDropdown({
  notifications,
  isLoading,
  onMarkRead,
  onDelete,
  onClose,
  onMarkAllRead,
  dropdownClassName,
}: NotificationDropdownProps) {
  return (
    <div
      className={`fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full z-50 sm:mt-3 w-auto sm:w-[24rem] sm:max-w-[24rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(10,40,80,0.18)] ${dropdownClassName || ""}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[#0b2b53]">Notifications</p>
          <p className="text-xs text-slate-500">Latest updates from your account</p>
        </div>
        <div className="flex items-center gap-2">
          {onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>
      </div>

      <div className="max-h-[20rem] overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <InboxIcon className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
            <p className="mt-1 text-xs text-slate-500">You will see donation, campaign, and account updates here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex gap-3 px-4 py-4 transition ${
                  notification.isRead ? "bg-white" : "bg-emerald-50/60"
                }`}
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => onMarkRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            notification.isRead ? "bg-slate-300" : "bg-emerald-500"
                          }`}
                        />
                        <p className={`truncate text-sm font-semibold ${notification.isRead ? "text-slate-700" : "text-[#0b2b53]"}`}>
                          {notification.title}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    className="mt-1 rounded-full p-2 text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-red-500"
                    aria-label="Delete notification"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <Link
          to="/notifications"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
        >
          View all notifications
          <CheckIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
