import type {
  AuthSuccessResponse,
  AuthRole,
  GenericSuccessResponse,
  MeResponse,
  VerifyResetOtpResponse,
} from "../types/auth";
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

export const forgotPasswordRequest = async (payload: { email: string }) => {
  const { data } = await http.post<GenericSuccessResponse>(
    "/auth/forgot-password",
    payload,
  );
  return data;
};

export const verifyResetOtpRequest = async (payload: {
  email: string;
  otp: string;
}) => {
  const { data } = await http.post<VerifyResetOtpResponse>(
    "/auth/verify-otp",
    payload,
  );
  return data;
};

export const resetForgottenPasswordRequest = async (payload: {
  resetToken: string;
  newPassword: string;
}) => {
  const { data } = await http.post<GenericSuccessResponse>(
    "/auth/reset-password",
    payload,
  );
  return data;
};
