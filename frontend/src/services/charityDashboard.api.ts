import { http } from "./httpClient";

export const getCharityDashboard = async () => {
  const { data } = await http.get("/charity-dashboard/overview");
  return data;
};

export const getCharityCampaigns = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  status?: "ACTIVE" | "CLOSED" | "DRAFT";
  sortBy?:
    | "createdAt"
    | "currentAmount"
    | "targetAmount"
    | "donorCount"
    | "endDate"
    | "title";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get("/charity-dashboard/campaigns", { params });
  return data;
};

export const getCharityContributions = async (params?: {
  page?: number;
  limit?: number;
  donationLimit?: number;
  search?: string;
  campaignId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "donatedAt" | "amount" | "status";
  sortOrder?: "asc" | "desc";
}) => {
  const { data } = await http.get("/charity-dashboard/contributions", {
    params,
  });
  return data;
};

export const getCharityCampaignContributions = async (
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
    { params },
  );
  return data;
};
