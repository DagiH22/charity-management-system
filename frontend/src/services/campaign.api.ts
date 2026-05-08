import { http } from "./httpClient";

export const createCampaign = async (token: string, payload: any) => {
  const { data } = await http.post(
    "/campaign/create",
    payload, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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


export const getCampaignById = async (token: string, id: string | undefined) => {
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
  }) => {
  const response = await http.put(`/campaign/${id}`, 
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  return response.data;
};

export const closeCampaign = async (token: string, id: string | undefined) => {
  const response = await http.put(`/campaign/${id}/close`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
