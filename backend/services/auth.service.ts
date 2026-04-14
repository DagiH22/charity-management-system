import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { env } from "../utils/env";

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
} as const;

export const registerUser = async ({ name, email, password, role }: RegisterInput) => {
  if (!["DONOR", "CHARITY"].includes(role)) {
    throw new ApiError(400, "Only DONOR or CHARITY registration is allowed");
  }

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
    },
    select: toSafeUserSelect,
  });

  const token = signToken(user.id, user.role);

  return { user, token };
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

  return { user: safeUser, token };
};

export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: toSafeUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
