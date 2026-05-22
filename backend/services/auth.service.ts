import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { env } from "../utils/env";
import { createNotification } from "./notification.service";

const SALT_ROUNDS = 12;
type AppRole = "DONOR" | "CHARITY" | "ADMIN";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: AppRole;
};

type LoginInput = {
  email: string;
  password: string;
};

const signToken = (id: number, role: AppRole): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

const toSafeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  charityProfile: {
    select: {
      id: true,
    },
  },
} as const;

type SafeUserWithProfile = {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  charityProfile: { id: number } | null;
};

const toAuthUser = (user: SafeUserWithProfile) => {
  const isVerified = user.role === "CHARITY" ? user.isVerified : true;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified,
    hasCharityProfile: Boolean(user.charityProfile),
    charityId: user.charityProfile?.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const registerUser = async ({ name, email, password, role }: RegisterInput) => {

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      isVerified: role === "CHARITY" ? false : true,
    },
    select: toSafeUserSelect,
  });

  const token = signToken(user.id, user.role);

  return { user: toAuthUser(user), token };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user.id, user.role);

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: toSafeUserSelect,
  });

  if (!safeUser) {
    throw new ApiError(404, "User not found");
  }

  return { user: toAuthUser(safeUser), token };
};

export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: toSafeUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return toAuthUser(user);
};

export const resetPassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true, email: true, name: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await createNotification(
      {
        userId: user.id,
        title: "Password reset successful",
        message: "Your password was successfully reset.",
        type: "AUTH",
        metadata: {
          email: user.email,
        },
      },
      tx,
    );
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: toSafeUserSelect,
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return toAuthUser(updatedUser);
};
