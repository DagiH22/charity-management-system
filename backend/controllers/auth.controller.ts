import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";

type AppRole = "DONOR" | "CHARITY" | "ADMIN";

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

  const data = await registerUser({ name, email, password, role });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    ...data,
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

  const data = await loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: "Login successful",
    ...data,
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
