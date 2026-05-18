import { http } from "./httpClient";

export const getDonorDashboard = async (token: string) => {
  const { data } = await http.get("/donor/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getDonorDonations = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/donations", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const getDonorAnonymousDonations = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/anonymous-donations", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const getDonorFollowingCampaigns = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/donor/following", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const toggleFollowCampaign = async (token: string, id: number) => {
  const { data } = await http.post(
    `/donor/campaign/${id}/follow`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data;
};
