import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";
import { env } from "../utils/env";

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
