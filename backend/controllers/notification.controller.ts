import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  deleteNotification,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from "../services/notification.service";

const parsePagination = (req: Request) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (!Number.isInteger(page) || page <= 0) {
    throw new ApiError(400, "Invalid page number");
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new ApiError(400, "Invalid limit number");
  }

  return { page, limit: Math.min(limit, 50) };
};

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const pagination = parsePagination(req);
  const data = await getUserNotifications(req.user.id, pagination);

  res.status(200).json({
    success: true,
    data,
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new ApiError(400, "Invalid notification id");
  }

  const data = await markAsRead(req.user.id, notificationId);

  res.status(200).json({
    success: true,
    data,
  });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const data = await markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const removeNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new ApiError(400, "Invalid notification id");
  }

  const data = await deleteNotification(req.user.id, notificationId);

  res.status(200).json({
    success: true,
    data,
  });
});
