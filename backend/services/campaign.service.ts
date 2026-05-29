import { Prisma, CampaignCategory } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";
import { createBulkNotifications } from "./notification.service";
import type { NotificationInput } from "./notification.service";
import { env } from "../utils/env";
import {
  consumeApprovedCampaignRequest,
  getApprovedAllowanceForCharity,
} from "./campaignRequest.service";

type UpdateCampaignPayload = {
  title?: string;
  description?: string;
  category?: CampaignCategory;
  targetAmount?: number;
  endDate?: string;
  imageUrl?: string | null;
};
type CreateCampaignPayload = {
  title: string;
  description: string;
  category: CampaignCategory;
  targetAmount: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
};

export const getCampaignByIdService = async (
  userId: number,
  campaignId: number,
) => {
  // Find charity profile
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
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
          socialFacebook: true,
          socialTelegram: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          socialTiktok: true,
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

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const campaign = await prisma.$transaction(async (tx) => {
    const currentMonthCampaignCount = await tx.campaign.count({
      where: {
        charityId: charityProfile.id,
        createdAt: { gte: currentMonthStart },
      },
    });

    const approvedAllowance = await getApprovedAllowanceForCharity(
      charityProfile.id,
      tx,
    );

    const hasReachedLimit = currentMonthCampaignCount >= 2;

    if (hasReachedLimit && !approvedAllowance) {
      throw new ApiError(
        403,
        "You have reached the monthly campaign limit. Request admin approval to create one more campaign.",
      );
    }

    const createdCampaign = await tx.campaign.create({
      data: {
        charityId: charityProfile.id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        targetAmount: new Prisma.Decimal(payload.targetAmount),
        currentAmount: new Prisma.Decimal(0),
        startDate,
        endDate,
        status: "ACTIVE",
        imageUrl: payload.imageUrl?.trim() || null,
      },
    });

    if (hasReachedLimit && approvedAllowance) {
      await consumeApprovedCampaignRequest(
        tx,
        approvedAllowance.id,
        createdCampaign.id,
      );
    }

    return createdCampaign;
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
    include: {
      charity: {
        select: {
          userId: true,
        },
      },
    },
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

    await createBulkNotifications(
      [
        {
          userId: donorId,
          title: "Donation successful",
          message: `Your donation of ${new Intl.NumberFormat("en-US").format(Number(amount))} ETB to ${campaign.title} was successful.`,
          type: "DONATION",
          metadata: {
            campaignId,
            donationId: createdDonation.id,
            amount,
            isAnonymous,
          },
        },
        {
          userId: campaign.charity.userId,
          title: "New donation received",
          message: `${isAnonymous ? "An anonymous donor" : "A donor"} contributed ${new Intl.NumberFormat("en-US").format(Number(amount))} ETB to ${campaign.title}.`,
          type: "DONATION",
          metadata: {
            campaignId,
            donationId: createdDonation.id,
            amount,
            isAnonymous,
            donorId,
          },
        },
      ] as NotificationInput[],
      tx,
    );

    return [createdDonation, updated];
  });
  return { donation, campaign: updatedCampaign };
};

export const getDonationByTxRefService = async (txRef: string) => {
  const donation = await prisma.donation.findFirst({
    where: { transactionId: txRef },
    include: {
      campaign: { select: { id: true, title: true, charityId: true } },
      donor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  return donation;
};

export const getMyCampaignsService = async (
  userId: number,
  options?: { category?: CampaignCategory },
) => {
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
      ...(options?.category ? { category: options.category } : {}),
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

  const updatedCampaign = await prisma.$transaction(async (tx) => {
    const updated = await tx.campaign.update({
      where: { id: campaignId },

      data: {
        ...(payload.title && {
          title: payload.title,
        }),

        ...(payload.description && {
          description: payload.description,
        }),

        ...(payload.category && {
          category: payload.category,
        }),

        ...(payload.targetAmount && {
          targetAmount: new Prisma.Decimal(payload.targetAmount),
        }),

        ...(payload.endDate && {
          endDate: new Date(payload.endDate),
        }),

        ...(payload.imageUrl !== undefined && {
          imageUrl: payload.imageUrl?.trim() || null,
        }),
      },
    });

    const followers = await tx.followCampaign.findMany({
      where: { campaignId },
      select: { userId: true },
    });

    if (followers.length) {
      await createBulkNotifications(
        followers.map((follower) => ({
          userId: follower.userId,
          title: "Campaign updated",
          message: `${updated.title} has been updated.`,
          type: "CAMPAIGN",
          metadata: {
            campaignId,
          },
        })) as NotificationInput[],
        tx,
      );
    }

    return updated;
  });

  return updatedCampaign;
};

export const closeCampaignService = async (
  userId: number,
  campaignId: number,
) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
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

  const closedCampaign = await prisma.$transaction(async (tx) => {
    const updated = await tx.campaign.update({
      where: { id: campaignId },

      data: {
        status: "CLOSED",
      },
    });

    const followers = await tx.followCampaign.findMany({
      where: { campaignId },
      select: { userId: true },
    });

    await createBulkNotifications(
      [
        {
          userId: charityProfile.userId,
          title: "Campaign closed",
          message: `${updated.title} has been closed successfully.`,
          type: "CAMPAIGN",
          metadata: {
            campaignId,
          },
        },
        ...followers.map((follower) => ({
          userId: follower.userId,
          title: "Campaign closed",
          message: `${updated.title} has been closed.`,
          type: "CAMPAIGN",
          metadata: {
            campaignId,
          },
        })),
      ] as NotificationInput[],
      tx,
    );

    return updated;
  });

  return closedCampaign;
};

export const getAllCampaignsService = async (options?: {
  category?: CampaignCategory;
}) => {
  return prisma.campaign.findMany({
    where: {
      status: {
        in: ["ACTIVE"],
      },
      ...(options?.category ? { category: options.category } : {}),
    },
    include: {
      charity: {
        select: {
          id: true,
          organizationName: true,
          address: true,
          socialFacebook: true,
          socialTelegram: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          socialTiktok: true,
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
          socialFacebook: true,
          socialTelegram: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          socialTiktok: true,
        },
      },
    },
  });
};
