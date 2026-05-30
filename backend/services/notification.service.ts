import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

export type NotificationType = "DONATION" | "CAMPAIGN" | "AUTH" | "SYSTEM";

type DbClient = Prisma.TransactionClient | typeof prisma;

export type NotificationInput = {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Prisma.InputJsonValue | null;
};

const notificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  notificationType: true,
  isRead: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

const toNotificationResponse = (notification: {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: notification.id,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  type: notification.notificationType,
  isRead: notification.isRead,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export const createNotification = async (
  input: NotificationInput,
  db: DbClient = prisma,
) => {
  const notification = await db.notification.create({
    data: {
      userId: input.userId,
      title: input.title.trim(),
      message: input.message.trim(),
      notificationType: input.type,
      metadata: input.metadata ?? undefined,
    },
    select: notificationSelect,
  });

  return toNotificationResponse(notification);
};

export const createBulkNotifications = async (
  inputs: NotificationInput[],
  db: DbClient = prisma,
) => {
  const notifications = [] as Awaited<ReturnType<typeof createNotification>>[];

  for (const input of inputs) {
    notifications.push(await createNotification(input, db));
  }

  return notifications;
};

export const getUserNotifications = async (
  userId: number,
  options: { page: number; limit: number },
) => {
  const { page, limit } = options;
  const where = { userId };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: notificationSelect,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items: items.map(toNotificationResponse),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const markAsRead = async (userId: number, notificationId: number) => {
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });

  if (!updated.count) {
    throw new ApiError(404, "Notification not found");
  }

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: notificationSelect,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return toNotificationResponse(notification);
};

export const markAllAsRead = async (userId: number) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return getUserNotifications(userId, { page: 1, limit: 10 });
};

export const deleteNotification = async (userId: number, notificationId: number) => {
  const deleted = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });

  if (!deleted.count) {
    throw new ApiError(404, "Notification not found");
  }

  return { deleted: true };
};
