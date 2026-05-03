import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

type CreateCampaignPayload = {
  title: string;
  description: string;
  targetAmount: number; 
  startDate: string;
  endDate: string;
};

export const createCampaignService = async (
  userId: number,
  payload: CreateCampaignPayload
) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!charityProfile) {
    throw new ApiError(
      400,
      "Please complete your charity profile before creating campaigns."
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
      status: "Pending",
    },
  });

  return campaign;
};