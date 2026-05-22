export type NotificationType = "DONATION" | "CAMPAIGN" | "AUTH" | "SYSTEM";

export type NotificationItem = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  success: true;
  data: {
    items: NotificationItem[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type NotificationActionResponse = {
  success: true;
  data: NotificationItem | { deleted: true } | { items: NotificationItem[]; total: number; unreadCount: number; page: number; limit: number; totalPages: number };
  message?: string;
};
