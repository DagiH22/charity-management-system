import type {
  AdminCampaignsResponse,
  AdminCharitiesResponse,
  AdminDonationsResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminUsersResponse,
} from "../types/adminDashboard";
import { http } from "./httpClient";

export const getAdminOverview = async () => {
  const { data } = await http.get<{
    success: true;
    data: AdminOverviewResponse;
  }>("/admin-dashboard/overview");
  return data;
};

export const getAdminUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "DONOR" | "CHARITY" | "ADMIN";
  verification?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "VERIFIED"
    | "UNVERIFIED";
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get<{ success: true; data: AdminUsersResponse }>(
    "/admin-dashboard/users",
    { params },
  );

  return data;
};

export const getAdminCharities = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  sortBy?: "createdAt" | "organizationName" | "updatedAt";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get<{
    success: true;
    data: AdminCharitiesResponse;
  }>("/admin-dashboard/charities", { params });

  return data;
};

export const getAdminCampaigns = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  status?: "ACTIVE" | "CLOSED" | "DRAFT";
  sortBy?: "createdAt" | "currentAmount" | "targetAmount" | "donorCount";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get<{
    success: true;
    data: AdminCampaignsResponse;
  }>("/admin-dashboard/campaigns", { params });

  return data;
};

export const getAdminDonations = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  campaignId?: number;
  anonymous?: boolean;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "donatedAt" | "amount" | "status";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get<{
    success: true;
    data: AdminDonationsResponse;
  }>("/admin-dashboard/donations", { params });

  return data;
};

export const getAdminReports = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  const { data } = await http.get<{
    success: true;
    data: AdminReportsResponse;
  }>("/admin-dashboard/reports", { params });

  return data;
};
