import type {
  ApproveCharityProfileResponse,
  CharityProfileResponse,
  CreateCharityProfileResponse,
  PendingCharityProfilesResponse,
  RejectCharityProfileResponse,
} from "../types/auth";
import { apiBaseUrl, http } from "./httpClient";

export const getMyCharityProfileRequest = async () => {
  const { data } = await http.get<CharityProfileResponse>(
    "/charity-profile/me",
  );

  return data;
};

export const updateMyCharityProfileRequest = async (
  payload: {
    organizationName?: string;
    description?: string;
    phone?: string;
    address?: string;
    website?: string;
    socialFacebook?: string;
    socialTelegram?: string;
    socialInstagram?: string;
    socialTwitter?: string;
    socialYoutube?: string;
    socialTiktok?: string;
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
  
  if (payload.socialFacebook !== undefined) {
    formData.append("socialFacebook", payload.socialFacebook);
  }
  
  if (payload.socialTelegram !== undefined) {
    formData.append("socialTelegram", payload.socialTelegram);
  }
  
  if (payload.socialInstagram !== undefined) {
    formData.append("socialInstagram", payload.socialInstagram);
  }
  
  if (payload.socialTwitter !== undefined) {
    formData.append("socialTwitter", payload.socialTwitter);
  }
  
  if (payload.socialYoutube !== undefined) {
    formData.append("socialYoutube", payload.socialYoutube);
  }
  
  if (payload.socialTiktok !== undefined) {
    formData.append("socialTiktok", payload.socialTiktok);
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
  payload: {
    organizationName: string;
    description: string;
    document: File;
    logo?: File | null;
    phone?: string;
    socialFacebook?: string;
    socialTelegram?: string;
    socialInstagram?: string;
    socialTwitter?: string;
    socialYoutube?: string;
    socialTiktok?: string;
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
  
  if (payload.socialFacebook?.trim()) {
    formData.append("socialFacebook", payload.socialFacebook.trim());
  }
  
  if (payload.socialTelegram?.trim()) {
    formData.append("socialTelegram", payload.socialTelegram.trim());
  }
  
  if (payload.socialInstagram?.trim()) {
    formData.append("socialInstagram", payload.socialInstagram.trim());
  }
  
  if (payload.socialTwitter?.trim()) {
    formData.append("socialTwitter", payload.socialTwitter.trim());
  }
  
  if (payload.socialYoutube?.trim()) {
    formData.append("socialYoutube", payload.socialYoutube.trim());
  }
  
  if (payload.socialTiktok?.trim()) {
    formData.append("socialTiktok", payload.socialTiktok.trim());
  }

  const { data } = await http.post<CreateCharityProfileResponse>(
    "/charity-profile",
    formData,
    {
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
    },
  );

  return data;
};

export const getPendingCharityProfilesRequest = async () => {
  const { data } = await http.get<PendingCharityProfilesResponse>(
    "/charity-profile/pending",
  );

  return data;
};

export const approveCharityProfileRequest = async (profileId: number) => {
  const { data } = await http.put<ApproveCharityProfileResponse>(
    `/charity-profile/${profileId}/approve`,
    undefined,
  );

  return data;
};

export const rejectCharityProfileRequest = async (profileId: number) => {
  const { data } = await http.put<RejectCharityProfileResponse>(
    `/charity-profile/${profileId}/reject`,
    undefined,
  );

  return data;
};

export const getPublicFileUrl = (documentUrl: string) => {
  if (documentUrl.startsWith("http://") || documentUrl.startsWith("https://")) {
    return documentUrl;
  }

  return `${apiBaseUrl}${documentUrl}`;
};
