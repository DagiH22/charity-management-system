import type {
  AuthSuccessResponse,
  AuthRole,
  GenericSuccessResponse,
  MeResponse,
  UpdateUserProfileResponse,
  UserProfileDetailsResponse,
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

export const getMyProfileRequest = async () => {
  const { data } = await http.get<UserProfileDetailsResponse>("/auth/profile");
  return data;
};

export const updateMyProfileRequest = async (
  payload: {
    name?: string;
    bio?: string;
    phone?: string;
    profileImage?: File | null;
    removeProfileImage?: boolean;
  },
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }

  if (payload.bio !== undefined) {
    formData.append("bio", payload.bio);
  }

  if (payload.phone !== undefined) {
    formData.append("phone", payload.phone);
  }

  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }

  if (payload.removeProfileImage) {
    formData.append("removeProfileImage", "true");
  }

  const { data } = await http.put<UpdateUserProfileResponse>(
    "/auth/profile",
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

export const resetPasswordRequest = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const { data } = await http.patch<AuthSuccessResponse>(
    "/auth/reset-password",
    payload,
  );

  return data;
};
