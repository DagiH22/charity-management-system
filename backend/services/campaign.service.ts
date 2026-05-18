import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

type UpdateCampaignPayload = {
  title?: string;
  description?: string;
  targetAmount?: number;
  endDate?: string;
};
type CreateCampaignPayload = {
  title: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
};

export const getCampaignByIdService = async (
  userId: number,
  campaignId: number,
) => {
  // Find charity profile
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  // Find campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  // Ownership check
  if (campaign.charityId !== charityProfile.id) {
    throw new ApiError(403, "You are not allowed to access this campaign");
  }

  return campaign;
};

export const getPublicCampaignByIdService = async (campaignId: number) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      charity: {
        select: {
          id: true,
          organizationName: true,
          description: true,
          logo: true,
          verifiedAt: true,
          address: true,
          phone: true,
          website: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  return campaign;
};

export const createCampaignService = async (
  userId: number,
  payload: CreateCampaignPayload,
) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(
      400,
      "Please complete your charity profile before creating campaigns.",
    );
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate < startDate) {
    throw new ApiError(400, "End date must be after start date.");
  }

  const campaign = await prisma.campaign.create({
    data: {
      charityId: charityProfile.id,
      title: payload.title,
      description: payload.description,
      targetAmount: new Prisma.Decimal(payload.targetAmount),
      currentAmount: new Prisma.Decimal(0),
      startDate,
      endDate,
      status: "ACTIVE",
    },
  });

  return campaign;
};

export const donateToCampaignService = async (
  campaignId: number,
  amount: number,
  donorId: number,
  isAnonymous: boolean = false,
  message?: string,
) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status === "CLOSED") {
    throw new ApiError(400, "Cannot donate to a closed campaign");
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Use a transaction to ensure both records update correctly
  const [donation, updatedCampaign] = await prisma.$transaction(async (tx) => {
    const existingDonation = await tx.donation.findFirst({
      where: {
        campaignId,
        donorId,
      },
    });

    const donorIncrement = existingDonation ? 0 : 1;

    const createdDonation = await tx.donation.create({
      data: {
        donorId,
        campaignId,
        amount,
        isAnonymous,
        message,
        transactionId,
        status: "COMPLETED", // Directly to complete since we mock Chapa for now
      },
      include: { campaign: true },
    });

    const updated = await tx.campaign.update({
      where: { id: campaignId },
      data: {
        currentAmount: {
          increment: amount,
        },
        donorCount: {
          increment: donorIncrement,
        },
      },
    });

    return [createdDonation, updated];
  });
  return { donation, campaign: updatedCampaign };
};

export const getMyCampaignsService = async (userId: number) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  return prisma.campaign.findMany({
    where: {
      charityId: charityProfile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateCampaignService = async (
  userId: number,
  campaignId: number,
  payload: UpdateCampaignPayload,
) => {
  // Find charity profile
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  // Find campaign
  const existingCampaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!existingCampaign) {
    throw new ApiError(404, "Campaign not found");
  }

  // Ownership check
  if (existingCampaign.charityId !== charityProfile.id) {
    throw new ApiError(403, "You are not allowed to edit this campaign");
  }

  // Prevent editing closed campaigns
  if (existingCampaign.status === "CLOSED") {
    throw new ApiError(400, "Closed campaigns cannot be edited");
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId },

    data: {
      ...(payload.title && {
        title: payload.title,
      }),

      ...(payload.description && {
        description: payload.description,
      }),

      ...(payload.targetAmount && {
        targetAmount: new Prisma.Decimal(payload.targetAmount),
      }),

      ...(payload.endDate && {
        endDate: new Date(payload.endDate),
      }),
    },
  });

  return updatedCampaign;
};

export const closeCampaignService = async (
  userId: number,
  campaignId: number,
) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  const existingCampaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!existingCampaign) {
    throw new ApiError(404, "Campaign not found");
  }

  // Ownership check
  if (existingCampaign.charityId !== charityProfile.id) {
    throw new ApiError(403, "You are not allowed to close this campaign");
  }

  // Already closed
  if (existingCampaign.status === "CLOSED") {
    throw new ApiError(400, "Campaign is already closed");
  }

  const closedCampaign = await prisma.campaign.update({
    where: { id: campaignId },

    data: {
      status: "CLOSED",
    },
  });

  return closedCampaign;
};

export const getAllCampaignsService = async () => {
  return prisma.campaign.findMany({
    where: {
      status: {
        in: ["ACTIVE"],
      },
    },
    include: {
      charity: {
        select: {
          id: true,
          organizationName: true,
          address: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getFeaturedCampaignsService = async () => {
  return prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
    },
    take: 3,
    orderBy: {
      currentAmount: "desc",
    },
    include: {
      charity: {
        select: {
          id: true,
          organizationName: true,
          address: true,
        },
      },
    },
  });
};
