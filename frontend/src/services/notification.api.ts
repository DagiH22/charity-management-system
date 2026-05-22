import type { NotificationActionResponse, NotificationListResponse } from "../types/notification";
import { http } from "./httpClient";

export const getNotificationsRequest = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const { data } = await http.get<NotificationListResponse>("/notifications", {
    params,
  });

  return data;
};

export const markNotificationAsReadRequest = async (id: number) => {
  const { data } = await http.patch<NotificationActionResponse>(
    `/notifications/${id}/read`,
  );

  return data;
};

export const markAllNotificationsAsReadRequest = async () => {
  const { data } = await http.patch<NotificationActionResponse>(
    "/notifications/read-all",
  );

  return data;
};

export const deleteNotificationRequest = async (id: number) => {
  const { data } = await http.delete<NotificationActionResponse>(
    `/notifications/${id}`,
  );

  return data;
};
