import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { env } from "../utils/env";
import { createNotification } from "./notification.service";
import {
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail,
} from "./email.service";

const SALT_ROUNDS = 12;
const PASSWORD_RESET_OTP_EXPIRATION_MINUTES = 15;
const PASSWORD_RESET_JWT_EXPIRES_IN = "10m";
const PASSWORD_RESET_PURPOSE = "PASSWORD_RESET";
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

type PasswordResetTokenPayload = {
  id: number;
  purpose: typeof PASSWORD_RESET_PURPOSE;
};

const signToken = (id: number, role: AppRole): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

const signPasswordResetToken = (id: number): string => {
  return jwt.sign(
    { id, purpose: PASSWORD_RESET_PURPOSE } satisfies PasswordResetTokenPayload,
    env.JWT_SECRET,
    {
      expiresIn: PASSWORD_RESET_JWT_EXPIRES_IN as SignOptions["expiresIn"],
    },
  );
};

const toSafeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  bio: true,
  phone: true,
  profileImage: true,
  createdAt: true,
  updatedAt: true,
  charityProfile: {
    select: {
      id: true,
    },
  },
} as const;

const bankAccountSelect = {
  id: true,
  bankName: true,
  accountNumber: true,
  accountHolder: true,
  type: true,
  isPrimary: true,
  createdAt: true,
} as const;

type SafeUserWithProfile = {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  isVerified: boolean;
  bio: string | null;
  phone: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  charityProfile: { id: number } | null;
};

type ProfileBankAccount = {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: "PERSONAL" | "BUSINESS";
  isPrimary: boolean;
  createdAt: Date;
};

type UserProfileWithDetails = SafeUserWithProfile & {
  bankAccounts: ProfileBankAccount[];
  charityProfile: {
    id: number;
    organizationName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    verifiedAt: Date | null;
    updatedAt: Date;
    phone: string | null;
    address: string | null;
    website: string | null;
    socialFacebook: string | null;
    socialTelegram: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialYoutube: string | null;
    socialTiktok: string | null;
  } | null;
};

const toAuthUser = (user: SafeUserWithProfile) => {
  const isVerified = user.role === "CHARITY" ? user.isVerified : true;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified,
    bio: user.bio,
    phone: user.phone,
    profileImage: user.profileImage,
    hasCharityProfile: Boolean(user.charityProfile),
    charityId: user.charityProfile?.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUserProfile = async (userId: number) => {
  const profile = (await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...toSafeUserSelect,
      bankAccounts: {
        select: bankAccountSelect as any,
      },
      charityProfile: {
        select: {
          id: true,
          organizationName: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          updatedAt: true,
          phone: true,
          address: true,
          website: true,
          socialFacebook: true,
          socialTelegram: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          socialTiktok: true,
        } as any,
      },
    } as any,
  })) as UserProfileWithDetails | null;

  if (!profile) {
    throw new ApiError(404, "User not found");
  }

  return {
    user: toAuthUser(profile),
    charityProfile: profile.charityProfile,
    bankAccounts: profile.bankAccounts,
  };
};

export const updateUserProfile = async (
  userId: number,
  payload: {
    name?: string;
    bio?: string;
    phone?: string;
    profileImage?: string | null;
  },
) => {
  const updated = (await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.bio !== undefined ? { bio: payload.bio.trim() || null } : {}),
      ...(payload.phone !== undefined
        ? { phone: payload.phone.trim() || null }
        : {}),
      ...(payload.profileImage !== undefined
        ? { profileImage: payload.profileImage?.trim() || null }
        : {}),
    },
    select: {
      ...toSafeUserSelect,
      bankAccounts: {
        select: bankAccountSelect as any,
      },
      charityProfile: {
        select: {
          id: true,
          organizationName: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          updatedAt: true,
          phone: true,
          address: true,
          website: true,
          socialFacebook: true,
          socialTelegram: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          socialTiktok: true,
        } as any,
      },
    } as any,
  })) as unknown as UserProfileWithDetails;

  return {
    user: toAuthUser(updated),
    charityProfile: updated.charityProfile,
    bankAccounts: updated.bankAccounts,
  };
};

const sendResetSuccessEmailSafely = async (recipientEmail: string) => {
  try {
    await sendPasswordResetSuccessEmail(recipientEmail);
  } catch (error) {
    console.error("Failed to send password reset success email", error);
  }
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

  await sendResetSuccessEmailSafely(user.email);

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: toSafeUserSelect,
  });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return toAuthUser(updatedUser);
};

export const forgotPassword = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });

  // Always return a generic message to avoid revealing account existence.
  if (!user) {
    return;
  }

  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expirationDate = new Date(
    Date.now() + PASSWORD_RESET_OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  await prisma.$transaction(async (tx) => {
    await tx.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    await tx.passwordReset.create({
      data: {
        userId: user.id,
        resetCode: otp,
        expirationDate,
      },
    });
  });

  await sendPasswordResetOtpEmail(user.email, otp);
};

export const verifyPasswordResetOtp = async (email: string, otp: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const passwordResetRecord = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      resetCode: normalizedOtp,
    },
  });

  if (!passwordResetRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (passwordResetRecord.expirationDate.getTime() < Date.now()) {
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const resetToken = signPasswordResetToken(user.id);

  return { resetToken };
};

export const resetPasswordWithToken = async (
  resetToken: string,
  newPassword: string,
) => {
  let payload: PasswordResetTokenPayload;

  try {
    payload = jwt.verify(resetToken, env.JWT_SECRET) as PasswordResetTokenPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired reset token");
  }

  if (payload.purpose !== PASSWORD_RESET_PURPOSE || !payload.id) {
    throw new ApiError(401, "Invalid or expired reset token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await tx.passwordReset.deleteMany({
      where: { userId: user.id },
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

  await sendResetSuccessEmailSafely(user.email);
};
