import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { createNotification } from "./notification.service";

type CreateCharityProfileInput = {
  userId: number;
  organizationName: string;
  description: string;
  documentUrl: string;
  logoUrl?: string | null;
  phone?: string;
  address?: string;
  website?: string;
};

type PendingCharityProfileSelectResult = {
  id: number;
  userId: number;
  organizationName: string;
  description: string;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  logo: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  };
};

type UpdateCharityProfileInput = {
  userId: number;
  organizationName?: string;
  description?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string | null;
};

const charityProfileSelect = {
  id: true,
  userId: true,
  organizationName: true,
  description: true,
  documentUrl: true,
  status: true,
  logo: true,
  phone: true,
  address: true,
  website: true,
  createdAt: true,
} as const;

export const createCharityProfile = async ({
  userId,
  organizationName,
  description,
  documentUrl,
  logoUrl,
  phone,
  address,
  website,
}: CreateCharityProfileInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "CHARITY") {
    throw new ApiError(403, "Only CHARITY users can create a charity profile");
  }

  const existingProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existingProfile) {
    throw new ApiError(409, "Charity profile already exists for this user");
  }

  const profile = await prisma.charityProfile.create({
    data: {
      userId,
      organizationName: organizationName.trim(),
      description: description.trim(),
      documentUrl: documentUrl.trim(),
      logo: logoUrl?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      website: website?.trim() || null,
    },
    select: charityProfileSelect,
  });

  return profile;
};

export const getMyCharityProfile = async (userId: number) => {
  const profile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: charityProfileSelect,
  });

  return profile;
};

export const updateMyCharityProfile = async ({
  userId,
  organizationName,
  description,
  phone,
  address,
  website,
  logoUrl,
}: UpdateCharityProfileInput) => {
  const profile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });

  if (!profile) {
    throw new ApiError(404, "Charity profile not found");
  }

  const updatedProfile = await prisma.charityProfile.update({
    where: { userId },
    data: {
      ...(organizationName && { organizationName: organizationName.trim() }),
      ...(description && { description: description.trim() }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(address !== undefined && { address: address?.trim() || null }),
      ...(website !== undefined && { website: website?.trim() || null }),
      ...(logoUrl !== undefined && { logo: logoUrl?.trim() || null }),
      ...(profile.status === "REJECTED"
        ? {
            status: "PENDING",
            verifiedAt: null,
          }
        : {}),
    },
    select: charityProfileSelect,
  });

  return updatedProfile;
};

export const getPendingCharityProfiles = async () => {
  const profiles = await prisma.charityProfile.findMany({
    where: {
      status: "PENDING",
      user: {
        role: "CHARITY",
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      ...charityProfileSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  return profiles as PendingCharityProfileSelectResult[];
};

export const approveCharityProfile = async (profileId: number) => {
  const profile = await prisma.charityProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          role: true,
          isVerified: true,
        },
      },
      status: true,
    },
  });

  if (!profile || profile.user.role !== "CHARITY") {
    throw new ApiError(404, "Charity profile not found");
  }

  if (profile.status === "APPROVED" || profile.user.isVerified) {
    throw new ApiError(409, "Charity profile is already approved");
  }

  if (profile.status === "REJECTED") {
    throw new ApiError(409, "Charity profile is already rejected");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: profile.userId },
      data: {
        isVerified: true,
      },
    });

    await tx.charityProfile.update({
      where: { id: profile.id },
      data: {
        status: "APPROVED",
        verifiedAt: new Date(),
      },
    });

    await createNotification(
      {
        userId: profile.userId,
        title: "Charity profile approved",
        message:
          "Your charity profile has been approved. You can now create and manage campaigns.",
        type: "AUTH",
        metadata: {
          profileId: profile.id,
        },
      },
      tx,
    );
  });

  const approvedProfile = await prisma.charityProfile.findUnique({
    where: { id: profileId },
    select: {
      ...charityProfileSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!approvedProfile) {
    throw new ApiError(404, "Charity profile not found after approval");
  }

  return approvedProfile;
};

export const rejectCharityProfile = async (profileId: number) => {
  const profile = await prisma.charityProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          role: true,
          isVerified: true,
        },
      },
      status: true,
    },
  });

  if (!profile || profile.user.role !== "CHARITY") {
    throw new ApiError(404, "Charity profile not found");
  }

  if (profile.status === "APPROVED" || profile.user.isVerified) {
    throw new ApiError(409, "Charity profile is already approved");
  }

  if (profile.status === "REJECTED") {
    throw new ApiError(409, "Charity profile is already rejected");
  }

  await prisma.$transaction(async (tx) => {
    await createNotification(
      {
        userId: profile.userId,
        title: "Charity profile rejected",
        message:
          "Your charity profile submission was rejected. Please update your information and submit again.",
        type: "AUTH",
        metadata: {
          profileId: profile.id,
        },
      },
      tx,
    );

    await tx.charityProfile.update({
      where: { id: profileId },
      data: {
        status: "REJECTED",
        verifiedAt: null,
      },
    });

    await tx.user.update({
      where: { id: profile.userId },
      data: { isVerified: false },
    });
  });

  return { rejected: true };
};
