import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../utils/env";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

type AppRole = "DONOR" | "CHARITY" | "ADMIN";

type AuthJwtPayload = JwtPayload & {
  id: number;
  role: AppRole;
};

const AUTH_COOKIE_NAME = "cms_auth";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  // Skip preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new ApiError(401, "Unauthorized: token is missing"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthJwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: safeUserSelect,
    });

    if (!user) {
      return next(new ApiError(401, "Unauthorized: user not found"));
    }

    req.user = user;

    return next();
  } catch {
    return next(new ApiError(401, "Unauthorized: invalid token"));
  }
};

export const authorize = (...roles: AppRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient permissions"));
    }

    return next();
  };
};

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Forbidden: admin access only"));
  }

  return next();
};

export const verifiedCharityOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

  if(!req.user.isVerified){
    return next(
      new ApiError(403, "Your charity account is not verified yet.")
    )
  }

  return next();
}

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(); // Just pass through, req.user will be undefined
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthJwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: safeUserSelect,
    });

    if (user) {
      req.user = user;
    }

    return next();
  } catch {
    return next(); // Invalid token, act as unauthenticated
  }
};
