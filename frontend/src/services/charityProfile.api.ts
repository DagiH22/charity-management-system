import type {
  ApproveCharityProfileResponse,
  CharityProfileResponse,
  CreateCharityProfileResponse,
  PendingCharityProfilesResponse,
} from "../types/auth";
import { apiBaseUrl, http } from "./httpClient";

export const getMyCharityProfileRequest = async (token: string) => {
  const { data } = await http.get<CharityProfileResponse>("/charity-profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const createMyCharityProfileRequest = async (
  token: string,
  payload: {
    organizationName: string;
    description: string;
    document: File;
    phone?: string;
    address?: string;
    website?: string;
  },
) => {
  const formData = new FormData();
  formData.append("organizationName", payload.organizationName);
  formData.append("description", payload.description);
  formData.append("document", payload.document);

  if (payload.phone?.trim()) {
    formData.append("phone", payload.phone.trim());
  }

  if (payload.address?.trim()) {
    formData.append("address", payload.address.trim());
  }

  if (payload.website?.trim()) {
    formData.append("website", payload.website.trim());
  }

  const { data } = await http.post<CreateCharityProfileResponse>("/charity-profile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const getPendingCharityProfilesRequest = async (token: string) => {
  const { data } = await http.get<PendingCharityProfilesResponse>("/charity-profile/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const approveCharityProfileRequest = async (token: string, profileId: number) => {
  const { data } = await http.patch<ApproveCharityProfileResponse>(
    `/charity-profile/${profileId}/approve`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const getPublicFileUrl = (documentUrl: string) => {
  if (documentUrl.startsWith("http://") || documentUrl.startsWith("https://")) {
    return documentUrl;
  }

  return `${apiBaseUrl}${documentUrl}`;
};