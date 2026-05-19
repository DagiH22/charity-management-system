import type {
  ApproveCharityProfileResponse,
  CharityProfileResponse,
  CreateCharityProfileResponse,
  PendingCharityProfilesResponse,
} from "../types/auth";
import { apiBaseUrl, http } from "./httpClient";

export const getMyCharityProfileRequest = async (token: string) => {
  const { data } = await http.get<CharityProfileResponse>(
    "/charity-profile/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const updateMyCharityProfileRequest = async (
  token: string,
  payload: {
    organizationName?: string;
    description?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: File | null;
    removeLogo?: boolean;
  },
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();

  if (payload.organizationName?.trim()) {
    formData.append("organizationName", payload.organizationName.trim());
  }

  if (payload.description?.trim()) {
    formData.append("description", payload.description.trim());
  }

  if (payload.phone !== undefined) {
    formData.append("phone", payload.phone);
  }

  if (payload.address !== undefined) {
    formData.append("address", payload.address);
  }

  if (payload.website !== undefined) {
    formData.append("website", payload.website);
  }

  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  if (payload.removeLogo) {
    formData.append("removeLogo", "true");
  }

  const { data } = await http.put<CharityProfileResponse>(
    "/charity-profile/me",
    formData,
    {
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
    },
  );

  return data;
};

export const createMyCharityProfileRequest = async (
  token: string,
  payload: {
    organizationName: string;
    description: string;
    document: File;
    logo?: File | null;
    phone?: string;
    address?: string;
    website?: string;
  },
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  formData.append("organizationName", payload.organizationName);
  formData.append("description", payload.description);
  formData.append("document", payload.document);

  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  if (payload.phone?.trim()) {
    formData.append("phone", payload.phone.trim());
  }

  if (payload.address?.trim()) {
    formData.append("address", payload.address.trim());
  }

  if (payload.website?.trim()) {
    formData.append("website", payload.website.trim());
  }

  const { data } = await http.post<CreateCharityProfileResponse>(
    "/charity-profile",
    formData,
    {
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
    },
  );

  return data;
};

export const getPendingCharityProfilesRequest = async (token: string) => {
  const { data } = await http.get<PendingCharityProfilesResponse>(
    "/charity-profile/pending",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const approveCharityProfileRequest = async (
  token: string,
  profileId: number,
) => {
  const { data } = await http.put<ApproveCharityProfileResponse>(
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
