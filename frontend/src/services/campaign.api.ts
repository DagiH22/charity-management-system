import { http } from "./httpClient";

export type CampaignDonationCheckout = {
  donation: {
    id: number;
    donorId: number;
    campaignId: number;
    amount: string;
    isAnonymous: boolean;
    message: string | null;
    transactionId: string | null;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    donatedAt: string;
  };
  chapa: {
    checkoutUrl: string;
  };
};

export const createCampaign = async (payload: {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
}) => {
  const { data } = await http.post("/campaign/create", payload);

  return data;
};

export const getMyCampaigns = async (params?: { category?: string }) => {
  const { data } = await http.get(`/campaign/my-campaigns`, { params });

  return data;
};

export const getCampaignById = async (id: string | undefined) => {
  const { data } = await http.get(`/campaign/${id}`);

  return data;
};

export const updateCampaign = async (
  id: string | undefined,
  data: {
    title: string;
    description: string;
    category: string;
    targetAmount: number;
    endDate: string;
    imageUrl?: string | null;
  },
) => {
  const response = await http.put(`/campaign/${id}`, data);
  return response.data;
};

export const uploadCampaignImage = async (
  file: File,
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await http.post("/campaign/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onUploadProgress?.(progress);
    },
  });

  return data;
};

export const closeCampaign = async (id: string | undefined) => {
  const response = await http.put(`/campaign/${id}/close`, {});
  return response.data;
};

export const getAllCampaigns = async (params?: { category?: string }) => {
  const { data } = await http.get(`/campaign/all`, { params });

  return data;
};
export const getFeaturedCampaigns = async () => {
  const { data } = await http.get(`/campaign/featured`);

  return data;
};

export const getPublicCampaignById = async (id: string | undefined) => {
  const { data } = await http.get(`/campaign/public/${id}`);
  return data;
};

export const donateToCampaignRequest = async (
  id: string | undefined,
  payload: {
    amount: number;
    isAnonymous: boolean;
    message?: string;
    returnUrl?: string;
  },
) => {
  const { data } = await http.post<{
    success: boolean;
    data: CampaignDonationCheckout;
  }>(`/campaign/${id}/donate`, payload);
  return data;
};

export const getDonationByTxRef = async (txRef: string) => {
  const { data } = await http.get(`/donation/${encodeURIComponent(txRef)}`);
  return data;
};

export type PlatformStats = {
  totalDonations: number;
  activeCampaigns: number;
  peopleHelped: number;
  totalDonors: number;
};

export const getPlatformStats = async () => {
  const { data } = await http.get<{ success: boolean; data: PlatformStats }>(
    "/stats/platform",
  );
  return data;
};
