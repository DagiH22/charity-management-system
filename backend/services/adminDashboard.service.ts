import { Prisma, CampaignLocation } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

const containsInsensitive = (value: string) =>
  ({ contains: value }) as unknown as Prisma.StringFilter;

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

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildRecentMonthKeys = (count: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  const keys: { key: string; label: string }[] = [];

  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    keys.push({
      key: getMonthKey(d),
      label: d.toLocaleString(undefined, { month: "short", year: "numeric" }),
    });
  }

  return keys;
};

export const getAdminOverviewService = async () => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const trendMonths = buildRecentMonthKeys(6);
  const trendStart = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() - 5,
    1,
  );

  const [
    totalRaisedAgg,
    totalDonations,
    activeCampaigns,
    donorsGroup,
    totalUsers,
    monthlyAgg,
    campaignStatusGroups,
    verificationCounts,
    recentDonations,
    topCampaigns,
    trendDonations,
  ] = await Promise.all([
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { status: "COMPLETED" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.donation.groupBy({
      by: ["donorId"],
      where: { status: "COMPLETED" },
    }),
    prisma.user.count(),
    prisma.donation.aggregate({
      where: {
        status: "COMPLETED",
        donatedAt: { gte: currentMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.campaign.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.charityProfile.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.donation.findMany({
      orderBy: { donatedAt: "desc" },
      take: 6,
      include: {
        donor: { select: { id: true, name: true, email: true } },
        campaign: {
          select: {
            id: true,
            title: true,
            charity: { select: { id: true, organizationName: true } },
          },
        },
      },
    }),
    prisma.campaign.findMany({
      orderBy: { currentAmount: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        location: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        charity: { select: { id: true, organizationName: true } },
      },
    }),
    prisma.donation.findMany({
      where: {
        status: "COMPLETED",
        donatedAt: { gte: trendStart },
      },
      select: { amount: true, donatedAt: true },
    }),
  ]);

  const campaignStatusCounts = campaignStatusGroups.reduce(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    { ACTIVE: 0, CLOSED: 0, DRAFT: 0 } as Record<
      "ACTIVE" | "CLOSED" | "DRAFT",
      number
    >,
  );

  const charityVerificationCounts = verificationCounts.reduce(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<
      "PENDING" | "APPROVED" | "REJECTED",
      number
    >,
  );

  const trendMap = new Map<
    string,
    { totalAmount: number; donationsCount: number }
  >();
  trendMonths.forEach((item) => {
    trendMap.set(item.key, { totalAmount: 0, donationsCount: 0 });
  });

  trendDonations.forEach((item) => {
    const key = getMonthKey(new Date(item.donatedAt));
    const entry = trendMap.get(key);

    if (!entry) {
      return;
    }

    entry.totalAmount += Number(item.amount);
    entry.donationsCount += 1;
  });

  const donationTrends = trendMonths.map((item) => ({
    month: item.label,
    totalAmount: trendMap.get(item.key)?.totalAmount || 0,
    donationsCount: trendMap.get(item.key)?.donationsCount || 0,
  }));

  return {
    stats: {
      totalRaised: Number(totalRaisedAgg._sum.amount || 0),
      totalDonations,
      activeCampaigns,
      totalDonors: donorsGroup.length,
      totalUsers,
      monthlyDonations: Number(monthlyAgg._sum.amount || 0),
    },
    campaignStatusCounts,
    charityVerificationCounts,
    donationTrends,
    topCampaigns,
    recentDonations,
  };
};

export const getAdminUsersService = async (options: {
  page: number;
  limit: number;
  search?: string;
  role?: "DONOR" | "CHARITY" | "ADMIN";
  verification?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "VERIFIED"
    | "UNVERIFIED";
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}) => {
  const { page, limit, search, role, verification, sortBy, sortOrder } =
    options;

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            {
              charityProfile: {
                organizationName: { contains: search },
              },
            },
          ],
        }
      : {}),
  };

  if (verification === "VERIFIED") {
    where.isVerified = true;
  }

  if (verification === "UNVERIFIED") {
    where.isVerified = false;
  }

  if (verification === "PENDING") {
    where.role = "CHARITY";
    where.charityProfile = { status: "PENDING" };
  }

  if (verification === "APPROVED") {
    where.role = "CHARITY";
    where.charityProfile = { status: "APPROVED" };
  }

  if (verification === "REJECTED") {
    where.role = "CHARITY";
    where.charityProfile = { status: "REJECTED" };
  }

  const [items, total, roleGroups] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        createdAt: true,
        charityProfile: {
          select: {
            id: true,
            organizationName: true,
            status: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const roleCounts = roleGroups.reduce(
    (acc, group) => {
      acc[group.role] = group._count._all;
      return acc;
    },
    { DONOR: 0, CHARITY: 0, ADMIN: 0 } as Record<
      "DONOR" | "CHARITY" | "ADMIN",
      number
    >,
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    roleCounts,
  };
};

export const getAdminCharityVerificationsService = async (options: {
  page: number;
  limit: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  sortBy?: "createdAt" | "organizationName" | "updatedAt";
  sortOrder?: "asc" | "desc";
}) => {
  const { page, limit, search, status, sortBy, sortOrder } = options;

  const where: Prisma.CharityProfileWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { organizationName: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }
      : {}),
  };

  const [items, total, statusGroups] = await Promise.all([
    prisma.charityProfile.findMany({
      where,
      orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
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
        updatedAt: true,
        verifiedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.charityProfile.count({ where }),
    prisma.charityProfile.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCounts = statusGroups.reduce(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<
      "PENDING" | "APPROVED" | "REJECTED",
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

export const getAdminCampaignOversightService = async (options: {
  page: number;
  limit: number;
  search?: string;
  location?: CampaignLocation;
  status?: "ACTIVE" | "CLOSED" | "DRAFT";
  sortBy?: "createdAt" | "currentAmount" | "targetAmount" | "donorCount";
  sortOrder?: "asc" | "desc";
}) => {
  const { page, limit, search, location, status, sortBy, sortOrder } = options;
  const searchTerm = search?.trim();

  const where: Prisma.CampaignWhereInput = {
    ...(status ? { status } : {}),
    ...(location ? { location } : {}),
    ...(searchTerm
      ? {
          OR: [
            { title: containsInsensitive(searchTerm) },
            { description: containsInsensitive(searchTerm) },
            {
              charity: {
                organizationName: containsInsensitive(searchTerm),
              },
            },
          ],
        }
      : {}),
  };

  const [items, total, statusGroups] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        imageUrl: true,
        category: true,
        location: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        createdAt: true,
        endDate: true,
        charity: {
          select: {
            id: true,
            organizationName: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.campaign.count({ where }),
    prisma.campaign.groupBy({
      by: ["status"],
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

export const getAdminDonationLogsService = async (options: {
  page: number;
  limit: number;
  search?: string;
  campaignId?: number;
  anonymous?: boolean;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "donatedAt" | "amount" | "status";
  sortOrder?: "asc" | "desc";
}) => {
  const {
    page,
    limit,
    search,
    campaignId,
    anonymous,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  } = options;

  const dateFilter = buildDateFilter(dateFrom, dateTo);

  const where: Prisma.DonationWhereInput = {
    ...(typeof anonymous === "boolean" ? { isAnonymous: anonymous } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...(status ? { status } : {}),
    ...(dateFilter ? { donatedAt: dateFilter } : {}),
    ...(search
      ? {
          OR: [
            { transactionId: { contains: search } },
            { donor: { name: { contains: search } } },
            { donor: { email: { contains: search } } },
            { campaign: { title: { contains: search } } },
          ],
        }
      : {}),
  };

  const [items, total, statusGroups] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { [sortBy || "donatedAt"]: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            charity: { select: { id: true, organizationName: true } },
          },
        },
      },
    }),
    prisma.donation.count({ where }),
    prisma.donation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCounts = statusGroups.reduce(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    {
      PENDING: 0,
      COMPLETED: 0,
      FAILED: 0,
      REFUNDED: 0,
    } as Record<"PENDING" | "COMPLETED" | "FAILED" | "REFUNDED", number>,
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

export const getAdminReportsService = async (options: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  const dateFilter = buildDateFilter(options.dateFrom, options.dateTo);

  const [
    campaignSummaries,
    platformTotals,
    trendDonations,
    recentUsersCount,
    activeDonorsCount,
    completedDonationsCount,
    activeCampaigns,
  ] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: { currentAmount: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        location: true,
        currentAmount: true,
        targetAmount: true,
        donorCount: true,
        createdAt: true,
        charity: { select: { id: true, organizationName: true } },
        donations: {
          where: {
            status: "COMPLETED",
            ...(dateFilter ? { donatedAt: dateFilter } : {}),
          },
          select: {
            donorId: true,
            amount: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.donation.count({
        where: {
          ...(dateFilter ? { donatedAt: dateFilter } : {}),
        },
      }),
      prisma.donation.aggregate({
        where: {
          status: "COMPLETED",
          ...(dateFilter ? { donatedAt: dateFilter } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.charityProfile.count(),
    ]),
    prisma.donation.findMany({
      where: {
        status: "COMPLETED",
        ...(dateFilter ? { donatedAt: dateFilter } : {}),
      },
      select: {
        amount: true,
        donatedAt: true,
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.donation.groupBy({
      by: ["donorId"],
      where: {
        status: "COMPLETED",
        donatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.donation.count({
      where: {
        status: "COMPLETED",
        donatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
  ]);

  const campaignSummaryRows = campaignSummaries.map((campaign) => {
    const totalRaised = campaign.donations.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0,
    );

    const uniqueDonors = new Set(
      campaign.donations.map((item) => item.donorId),
    );

    return {
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      location: campaign.location,
      charity: campaign.charity,
      targetAmount: Number(campaign.targetAmount),
      currentAmount: Number(campaign.currentAmount),
      donorCount: campaign.donorCount,
      periodRaised: totalRaised,
      periodDonationsCount: campaign.donations.length,
      periodUniqueDonors: uniqueDonors.size,
    };
  });

  const trendMonths = buildRecentMonthKeys(12);
  const trendMap = new Map<
    string,
    { totalAmount: number; donationsCount: number }
  >();

  trendMonths.forEach((item) => {
    trendMap.set(item.key, { totalAmount: 0, donationsCount: 0 });
  });

  trendDonations.forEach((item) => {
    const key = getMonthKey(new Date(item.donatedAt));
    const row = trendMap.get(key);

    if (!row) {
      return;
    }

    row.totalAmount += Number(item.amount);
    row.donationsCount += 1;
  });

  const donationTrends = trendMonths.map((item) => ({
    month: item.label,
    totalAmount: trendMap.get(item.key)?.totalAmount || 0,
    donationsCount: trendMap.get(item.key)?.donationsCount || 0,
  }));

  return {
    platformStats: {
      totalUsers: platformTotals[0],
      totalCampaigns: platformTotals[1],
      totalDonations: platformTotals[2],
      totalRaised: Number(platformTotals[3]._sum.amount || 0),
      totalCharityProfiles: platformTotals[4],
    },
    campaignSummaries: campaignSummaryRows,
    donationTrends,
    systemUsage: {
      newUsersLast30Days: recentUsersCount,
      activeDonorsLast30Days: activeDonorsCount.length,
      completedDonationsLast30Days: completedDonationsCount,
      activeCampaigns,
    },
  };
};

export const toggleUserSuspensionService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { charityProfile: true }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const newSuspendedState = !user.isSuspended;

  const updateData: any = {
    isSuspended: newSuspendedState,
  };

  if (newSuspendedState) {
    updateData.isVerified = false;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  if (user.role === "CHARITY" && user.charityProfile && newSuspendedState) {
    await prisma.charityProfile.update({
      where: { userId: user.id },
      data: { status: "REJECTED" },
    });
  }

  return { suspended: newSuspendedState, user: updatedUser };
};
