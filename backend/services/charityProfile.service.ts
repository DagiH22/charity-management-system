import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

type CreateCharityProfileInput = {
  userId: number;
  organizationName: string;
  description: string;
  documentUrl: string;
  phone?: string;
  address?: string;
  website?: string;
};

const charityProfileSelect = {
  id: true,
  userId: true,
  organizationName: true,
  description: true,
  documentUrl: true,
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
