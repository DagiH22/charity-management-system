import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export const getDonorDashboardService = async (userId: number) => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const [totalDonatedAgg, monthlyTotalAgg, anonymousCount, activeFollowed] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { donorId: userId, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: {
          donorId: userId,
          status: "COMPLETED",
          donatedAt: { gte: currentMonthStart },
        },
        _sum: { amount: true },
      }),
      prisma.donation.count({ where: { donorId: userId, isAnonymous: true } }),
      prisma.followCampaign.count({
        where: { userId, campaign: { status: "ACTIVE" } },
      }),
    ]);

  const campaignsSupported = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { donorId: userId, status: "COMPLETED" },
  });

  const [recentDonations, followingPreview] = await Promise.all([
    prisma.donation.findMany({
      where: { donorId: userId },
      orderBy: { donatedAt: "desc" },
      take: 5,
      include: { campaign: { include: { charity: true } } },
    }),
    prisma.followCampaign.findMany({
      where: { userId },
      include: { campaign: { include: { charity: true } } },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalDonated: Number(totalDonatedAgg._sum.amount || 0),
      campaignsSupported: campaignsSupported.length,
      monthlyTotal: Number(monthlyTotalAgg._sum.amount || 0),
      activeFollowed,
      anonymousCount,
    },
    recentDonations,
    followingPreview,
  };
};

export const getDonorDonationsService = async (
  userId: number,
  options: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.DonationWhereInput = {
    donorId: userId,
    ...(search
      ? {
          campaign: {
            title: { contains: search },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { [sortBy || "donatedAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { campaign: { include: { charity: true } } },
    }),
    prisma.donation.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getDonorAnonymousDonationsService = async (
  userId: number,
  options: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: "donatedAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.DonationWhereInput = {
    donorId: userId,
    isAnonymous: true,
    ...(search
      ? {
          campaign: {
            title: { contains: search },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { [sortBy || "donatedAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { campaign: { include: { charity: true } } },
    }),
    prisma.donation.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getDonorFollowingCampaignsService = async (
  userId: number,
  options: {
    page: number;
    limit: number;
    search?: string;
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
    sortOrder?: "asc" | "desc";
  },
) => {
  const { page, limit, search, status, sortOrder } = options;
  const campaignWhere: Prisma.CampaignWhereInput = {
    ...(search ? { title: { contains: search } } : {}),
    ...(status ? { status } : {}),
  };

  const where: Prisma.FollowCampaignWhereInput = {
    userId,
    ...(Object.keys(campaignWhere).length ? { campaign: campaignWhere } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.followCampaign.findMany({
      where,
      orderBy: { createdAt: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { campaign: { include: { charity: true } } },
    }),
    prisma.followCampaign.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const toggleFollowCampaignService = async (
  userId: number,
  campaignId: number,
) => {
  const existingFollow = await prisma.followCampaign.findUnique({
    where: { userId_campaignId: { userId, campaignId } },
  });

  if (existingFollow) {
    await prisma.followCampaign.delete({
      where: { userId_campaignId: { userId, campaignId } },
    });
    return { followed: false };
  } else {
    await prisma.followCampaign.create({
      data: { userId, campaignId },
    });
    return { followed: true };
  }
};
