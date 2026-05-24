import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  forgotPassword,
  getCurrentUser,
  getUserProfile,
  loginUser,
  registerUser,
  resetPassword,
  resetPasswordWithToken,
  updateUserProfile,
  verifyPasswordResetOtp,
} from "../services/auth.service";
import { env } from "../utils/env";
import { uploadFile } from "../services/file.service";

type AppRole = "DONOR" | "CHARITY" | "ADMIN";

const AUTH_COOKIE_NAME = "cms_auth";

const parseJwtExpiresToMs = (value: string): number => {
  const normalized = value.trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) * 1000;
  }

  const match = normalized.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

const getAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: parseJwtExpiresToMs(env.JWT_EXPIRES_IN),
    path: "/",
  };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as {
    name?: string;
    email?: string;
    password?: string;
    role?: AppRole;
  };

  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "name, email, password and role are required");
  }

  const { token, user } = await registerUser({ name, email, password, role });

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as {
    email?: string;
    password?: string;
  };

  const { email, password } = body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const { token, user } = await loginUser({ email, password });

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

type UploadedFile = {
  filename: string;
};

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const data = await getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const requestWithFile = req as Request & { file?: UploadedFile };
  const body = (req.body ?? {}) as {
    name?: string;
    bio?: string;
    phone?: string;
    removeProfileImage?: string;
  };

  const profileImage = requestWithFile.file
    ? uploadFile(requestWithFile.file, "Profile image is required")
    : body.removeProfileImage === "true"
      ? null
      : undefined;

  const data = await updateUserProfile(req.user.id, {
    name: body.name,
    bio: body.bio,
    phone: body.phone,
    profileImage,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data,
  });
});

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const body = (req.body ?? {}) as {
    oldPassword?: string;
    newPassword?: string;
  };

  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "oldPassword and newPassword are required");
  }

  const user = await resetPassword(req.user.id, oldPassword, newPassword);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
    user,
  });
});

const FORGOT_PASSWORD_GENERIC_MESSAGE =
  "If an account with that email exists, a reset code has been sent.";

export const forgotUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      email?: string;
    };

    const email = body.email?.trim();

    if (!email) {
      throw new ApiError(400, "email is required");
    }

    await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: FORGOT_PASSWORD_GENERIC_MESSAGE,
    });
  },
);

export const verifyPasswordResetCode = asyncHandler(
  async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      email?: string;
      otp?: string;
    };

    const email = body.email?.trim();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      throw new ApiError(400, "email and otp are required");
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new ApiError(400, "OTP must be a 6-digit code");
    }

    const { resetToken } = await verifyPasswordResetOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP verified",
      data: {
        resetToken,
        expiresIn: "10m",
      },
    });
  },
);

export const resetForgottenPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      resetToken?: string;
      newPassword?: string;
    };

    const resetToken = body.resetToken?.trim();
    const newPassword = body.newPassword;

    if (!resetToken || !newPassword) {
      throw new ApiError(400, "resetToken and newPassword are required");
    }

    await resetPasswordWithToken(resetToken, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  },
);
