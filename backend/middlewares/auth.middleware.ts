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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized: token is missing"));
  }

  const token = authHeader.split(" ")[1];

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
