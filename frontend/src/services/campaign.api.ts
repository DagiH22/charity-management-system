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