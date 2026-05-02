import type {
  AuthSuccessResponse,
  AuthRole,
  MeResponse,
} from "../types/auth";
import { http } from "./httpClient";

const TOKEN_KEY = "cms_auth_token";

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
