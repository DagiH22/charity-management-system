import { http } from "./httpClient";

export const createCampaign = async (
  token: string,
  payload: {
    title: string;
    description: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
    imageUrl?: string | null;
  },
) => {
  const { data } = await http.post("/campaign/create", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const getMyCampaigns = async (token: string) => {
  const { data } = await http.get(`/campaign/my-campaigns`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const getCampaignById = async (
  token: string,
  id: string | undefined,
) => {
  const { data } = await http.get(`/campaign/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const updateCampaign = async (
  token: string,
  id: string | undefined,
  data: {
    title: string;
    description: string;
    targetAmount: number;
    endDate: string;
    imageUrl?: string | null;
  },
) => {
  const response = await http.put(`/campaign/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadCampaignImage = async (
  token: string,
  file: File,
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await http.post("/campaign/image", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
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

export const closeCampaign = async (token: string, id: string | undefined) => {
  const response = await http.put(
    `/campaign/${id}/close`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

export const getAllCampaigns = async () => {
  const { data } = await http.get(`/campaign/all`);

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
  token: string,
  id: string | undefined,
  payload: {
    amount: number;
    isAnonymous: boolean;
    message?: string;
  },
) => {
  const { data } = await http.post(`/campaign/${id}/donate`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
