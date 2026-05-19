import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

type CampaignSortBy =
  | "createdAt"
  | "currentAmount"
  | "targetAmount"
  | "donorCount"
  | "endDate"
  | "title";

type DonationSortBy = "donatedAt" | "amount" | "status";

const getCharityProfile = async (userId: number) => {
  const charityProfile = await prisma.charityProfile.findUnique({
    where: { userId },
    select: { id: true, organizationName: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  return charityProfile;
};

const buildDateFilter = (dateFrom?: string, dateTo?: string) => {
  if (!dateFrom && !dateTo) {
    return undefined;
  }

  const fromDate = dateFrom ? new Date(dateFrom) : undefined;
  const toDate = dateTo ? new Date(dateTo) : undefined;
  const isValidFrom = fromDate && !Number.isNaN(fromDate.getTime());
  const isValidTo = toDate && !Number.isNaN(toDate.getTime());

  if (!isValidFrom && !isValidTo) {
    return undefined;
  }

  return {
    ...(isValidFrom ? { gte: fromDate } : {}),
    ...(isValidTo ? { lte: toDate } : {}),
  } as Prisma.DateTimeFilter;
};

export const getCharityDashboardService = async (userId: number) => {
  const charityProfile = await getCharityProfile(userId);

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const [
    totalRaisedAgg,
    monthlyAgg,
    activeCampaigns,
    totalCampaigns,
    contributorsGroup,
    activeCampaignPreview,
    recentContributions,
  ] = await Promise.all([
    prisma.donation.aggregate({
      where: {
        campaign: { charityId: charityProfile.id },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: {
        campaign: { charityId: charityProfile.id },
        status: "COMPLETED",
        donatedAt: { gte: currentMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.campaign.count({
      where: { charityId: charityProfile.id, status: "ACTIVE" },
    }),
    prisma.campaign.count({
      where: { charityId: charityProfile.id },
    }),
    prisma.donation.groupBy({
      where: {
        campaign: { charityId: charityProfile.id },
        status: "COMPLETED",
      },
      by: ["donorId"],
    }),
    prisma.campaign.findMany({
      where: { charityId: charityProfile.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        status: true,
        endDate: true,
      },
    }),
    prisma.donation.findMany({
      where: { campaign: { charityId: charityProfile.id } },
      orderBy: { donatedAt: "desc" },
      take: 5,
      include: {
        donor: { select: { id: true, name: true, profileImage: true } },
        campaign: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    stats: {
      totalRaised: Number(totalRaisedAgg._sum.amount || 0),
      monthlyContributions: Number(monthlyAgg._sum.amount || 0),
      activeCampaigns,
      totalCampaigns,
      totalContributors: contributorsGroup.length,
    },
    activeCampaigns: activeCampaignPreview,
    recentContributions,
  };
};

export const getCharityCampaignsService = async (
  userId: number,
  options: {
    page: number;
    limit: number;
    search?: string;
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
    sortBy?: CampaignSortBy;
    sortOrder?: "asc" | "desc";
  },
) => {
  const charityProfile = await getCharityProfile(userId);
  const { page, limit, search, status, sortBy, sortOrder } = options;

  const where: Prisma.CampaignWhereInput = {
    charityId: charityProfile.id,
    ...(status ? { status } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const orderBy: Prisma.CampaignOrderByWithRelationInput = {
    [sortBy || "createdAt"]: sortOrder || "desc",
  };

  const [items, total, statusGroups] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        status: true,
        endDate: true,
      },
    }),
    prisma.campaign.count({ where }),
    prisma.campaign.groupBy({
      by: ["status"],
      where: { charityId: charityProfile.id },
      _count: { _all: true },
    }),
  ]);

  const statusCounts = statusGroups.reduce(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    { ACTIVE: 0, CLOSED: 0, DRAFT: 0 } as Record<
      "ACTIVE" | "CLOSED" | "DRAFT",
      number
    >,
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
  };
};

export const getCharityContributionsService = async (
  userId: number,
  options: {
    page: number;
    limit: number;
    donationLimit: number;
    search?: string;
    campaignId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: DonationSortBy;
    sortOrder?: "asc" | "desc";
  },
) => {
  const charityProfile = await getCharityProfile(userId);
  const {
    page,
    limit,
    donationLimit,
    search,
    campaignId,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  } = options;

  const dateFilter = buildDateFilter(dateFrom, dateTo);

  let campaignIdsFromDonations: number[] = [];

  if (search) {
    const donationMatches = await prisma.donation.findMany({
      where: {
        campaign: { charityId: charityProfile.id },
        OR: [
          { transactionId: { contains: search } },
          { donor: { name: { contains: search } } },
        ],
      },
      select: { campaignId: true },
      distinct: ["campaignId"],
    });

    campaignIdsFromDonations = donationMatches.map((item) => item.campaignId);
  }

  const campaignWhere: Prisma.CampaignWhereInput = {
    charityId: charityProfile.id,
    ...(campaignId ? { id: campaignId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            ...(campaignIdsFromDonations.length
              ? [{ id: { in: campaignIdsFromDonations } }]
              : []),
          ],
        }
      : {}),
  };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where: campaignWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        status: true,
        endDate: true,
      },
    }),
    prisma.campaign.count({ where: campaignWhere }),
  ]);

  const items = await Promise.all(
    campaigns.map(async (campaign) => {
      const donationWhere: Prisma.DonationWhereInput = {
        campaignId: campaign.id,
        ...(dateFilter ? { donatedAt: dateFilter } : {}),
        ...(search
          ? {
              OR: [
                { transactionId: { contains: search } },
                { donor: { name: { contains: search } } },
              ],
            }
          : {}),
      };

      const [totalsAgg, donorGroups, donationsCount, donations] =
        await Promise.all([
          prisma.donation.aggregate({
            where: {
              ...donationWhere,
              status: "COMPLETED",
            },
            _sum: { amount: true },
          }),
          prisma.donation.groupBy({
            where: {
              ...donationWhere,
              status: "COMPLETED",
            },
            by: ["donorId"],
          }),
          prisma.donation.count({ where: donationWhere }),
          prisma.donation.findMany({
            where: donationWhere,
            orderBy: { [sortBy || "donatedAt"]: sortOrder || "desc" },
            take: donationLimit,
            include: {
              donor: { select: { id: true, name: true, profileImage: true } },
            },
          }),
        ]);

      return {
        campaign,
        totals: {
          totalRaised: Number(totalsAgg._sum.amount || 0),
          donorCount: donorGroups.length,
          donationsCount,
        },
        donations,
      };
    }),
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getCharityCampaignContributionsService = async (
  userId: number,
  campaignId: number,
  options: {
    page: number;
    limit: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: DonationSortBy;
    sortOrder?: "asc" | "desc";
  },
) => {
  const charityProfile = await getCharityProfile(userId);
  const { page, limit, search, dateFrom, dateTo, sortBy, sortOrder } = options;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, charityId: charityProfile.id },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      currentAmount: true,
      targetAmount: true,
      donorCount: true,
      status: true,
      endDate: true,
    },
  });

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const dateFilter = buildDateFilter(dateFrom, dateTo);

  const donationWhere: Prisma.DonationWhereInput = {
    campaignId,
    ...(dateFilter ? { donatedAt: dateFilter } : {}),
    ...(search
      ? {
          OR: [
            { transactionId: { contains: search } },
            { donor: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [donations, total, totalsAgg, donorGroups, donationsCount] =
    await Promise.all([
      prisma.donation.findMany({
        where: donationWhere,
        orderBy: { [sortBy || "donatedAt"]: sortOrder || "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          donor: { select: { id: true, name: true, profileImage: true } },
        },
      }),
      prisma.donation.count({ where: donationWhere }),
      prisma.donation.aggregate({
        where: { ...donationWhere, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.donation.groupBy({
        where: { ...donationWhere, status: "COMPLETED" },
        by: ["donorId"],
      }),
      prisma.donation.count({ where: donationWhere }),
    ]);

  return {
    campaign,
    donations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    totals: {
      totalRaised: Number(totalsAgg._sum.amount || 0),
      donorCount: donorGroups.length,
      donationsCount,
    },
  };
};
