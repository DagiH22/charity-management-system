import type { AuthSuccessResponse, AuthRole, MeResponse } from "../types/auth";
import { http } from "./httpClient";

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

export const meRequest = async () => {
  const { data } = await http.get<MeResponse>("/auth/me");
  return data;
};

export const logoutRequest = async () => {
  const { data } = await http.post("/auth/logout");
  return data;
};
