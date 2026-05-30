import { http } from "./httpClient";

export const getDonorDashboard = async () => {
  const { data } = await http.get("/donor/dashboard");
  return data;
};

export const getDonorDonations = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/donations", { params });
  return data;
};

export const getDonorAnonymousDonations = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/anonymous-donations", { params });
  return data;
};

export const getDonorFollowingCampaigns = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/following", { params });
  return data;
};

export const toggleFollowCampaign = async (id: number) => {
  const { data } = await http.post(`/donor/campaign/${id}/follow`, {});
  return data;
};
