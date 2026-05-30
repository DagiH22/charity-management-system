import { http } from "./httpClient";
import type {
  AdminCampaignRequestsResponse,
  CharityCampaignRequestsResponse,
} from "../types/campaignRequest";

export const createCampaignRequest = async (payload: { reason: string }) => {
  const { data } = await http.post<{ success: true; data: unknown }>(
    "/campaign-requests",
    payload,
  );

  return data;
};

export const getMyCampaignRequests = async (params?: { page?: number; limit?: number }) => {
  const { data } = await http.get<{ success: true; data: CharityCampaignRequestsResponse }>(
    "/campaign-requests/me",
    { params },
  );

  return data;
};

export const getAdminCampaignRequests = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get<{ success: true; data: AdminCampaignRequestsResponse }>(
    "/campaign-requests/admin",
    { params },
  );

  return data;
};

export const approveCampaignRequest = async (requestId: number) => {
  const { data } = await http.put<{ success: true; message: string; data: unknown }>(
    `/campaign-requests/admin/${requestId}/approve`,
    undefined,
  );

  return data;
};

export const rejectCampaignRequest = async (requestId: number) => {
  const { data } = await http.put<{ success: true; message: string; data: unknown }>(
    `/campaign-requests/admin/${requestId}/reject`,
    undefined,
  );

  return data;
};
