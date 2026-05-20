import { http } from "./httpClient";

export const getCharityDashboard = async (token: string) => {
  const { data } = await http.get("/charity-dashboard/overview", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getCharityCampaigns = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
    sortBy?:
      | "createdAt"
      | "currentAmount"
      | "targetAmount"
      | "donorCount"
      | "endDate"
      | "title";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/charity-dashboard/campaigns", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const getCharityContributions = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    donationLimit?: number;
    search?: string;
    campaignId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get("/charity-dashboard/contributions", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

export const getCharityCampaignContributions = async (
  token: string,
  campaignId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { data } = await http.get(
    `/charity-dashboard/contributions/${campaignId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    },
  );
  return data;
};
