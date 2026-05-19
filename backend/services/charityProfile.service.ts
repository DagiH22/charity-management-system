import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

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
    select: { id: true },
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
    },
    select: charityProfileSelect,
  });

  return updatedProfile;
};

export const getPendingCharityProfiles = async () => {
  const profiles = await prisma.charityProfile.findMany({
    where: {
      user: {
        role: "CHARITY",
        isVerified: false,
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
    },
  });

  if (!profile || profile.user.role !== "CHARITY") {
    throw new ApiError(404, "Charity profile not found");
  }

  if (profile.user.isVerified) {
    throw new ApiError(409, "Charity profile is already approved");
  }

  await prisma.user.update({
    where: { id: profile.userId },
    data: {
      isVerified: true,
    },
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
