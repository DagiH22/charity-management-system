import axios from "axios";
import type {
  AuthSuccessResponse,
  AuthRole,
  CharityProfileResponse,
  CreateCharityProfileResponse,
  MeResponse,
} from "../types/auth";

const TOKEN_KEY = "cms_auth_token";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const registerRequest = async (payload: {
  name: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "ADMIN">;
}) => {
  const { data } = await http.post<AuthSuccessResponse>("/auth/register", payload);
  return data;
};

export const loginRequest = async (payload: { email: string; password: string }) => {
  const { data } = await http.post<AuthSuccessResponse>("/auth/login", payload);
  return data;
};

export const meRequest = async (token: string) => {
  const { data } = await http.get<MeResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

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

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
};
