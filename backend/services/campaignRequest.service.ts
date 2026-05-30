import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";
import { createBulkNotifications, createNotification } from "./notification.service";
import type { NotificationInput } from "./notification.service";

export type CampaignRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type DbClient = Prisma.TransactionClient | typeof prisma;

const getCurrentMonthStart = () => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  return currentMonthStart;
};

const campaignRequestSelect = {
  id: true,
  charityId: true,
  reason: true,
  status: true,
  requestedAt: true,
  reviewedAt: true,
  reviewedById: true,
  consumedAt: true,
  consumedCampaignId: true,
  monthCampaignCount: true,
  totalCampaignCount: true,
  activeCampaignCount: true,
  charity: {
    select: {
      id: true,
      organizationName: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  reviewedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

const toCampaignRequest = (request: {
  id: number;
  charityId: number;
  reason: string;
  status: CampaignRequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedById: number | null;
  consumedAt: Date | null;
  consumedCampaignId: number | null;
  monthCampaignCount: number;
  totalCampaignCount: number;
  activeCampaignCount: number;
  charity: {
    id: number;
    organizationName: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  reviewedBy: {
    id: number;
    name: string;
    email: string;
  } | null;
}) => ({
  id: request.id,
  charityId: request.charityId,
  reason: request.reason,
  status: request.status,
  requestedAt: request.requestedAt,
  reviewedAt: request.reviewedAt,
  reviewedById: request.reviewedById,
  consumedAt: request.consumedAt,
  consumedCampaignId: request.consumedCampaignId,
  monthCampaignCount: request.monthCampaignCount,
  totalCampaignCount: request.totalCampaignCount,
  activeCampaignCount: request.activeCampaignCount,
  charity: request.charity,
  reviewedBy: request.reviewedBy,
});

const getCharityProfile = async (userId: number, db: DbClient = prisma) => {
  const charityProfile = await db.charityProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true, organizationName: true },
  });

  if (!charityProfile) {
    throw new ApiError(404, "Charity profile not found");
  }

  return charityProfile;
};

export const getCharityCampaignRequestSummary = async (
  userId: number,
  db: DbClient = prisma,
) => {
  const charityProfile = await getCharityProfile(userId, db);
  const currentMonthStart = getCurrentMonthStart();

  const [currentMonthCampaignCount, totalCampaignCount, activeCampaignCount, pendingRequestCount, approvedAllowanceCount] =
    await Promise.all([
      db.campaign.count({
        where: {
          charityId: charityProfile.id,
          createdAt: { gte: currentMonthStart },
        },
      }),
      db.campaign.count({
        where: {
          charityId: charityProfile.id,
        },
      }),
      db.campaign.count({
        where: {
          charityId: charityProfile.id,
          status: "ACTIVE",
        },
      }),
      db.campaignRequest.count({
        where: {
          charityId: charityProfile.id,
          status: "PENDING",
        },
      }),
      db.campaignRequest.count({
        where: {
          charityId: charityProfile.id,
          status: "APPROVED",
          consumedAt: null,
        },
      }),
    ]);

  return {
    charity: charityProfile,
    currentMonthCampaignCount,
    totalCampaignCount,
    activeCampaignCount,
    pendingRequestCount,
    approvedAllowanceCount,
    monthlyLimit: 2,
    hasExceededLimit: currentMonthCampaignCount >= 2,
    hasApprovedAllowance: approvedAllowanceCount > 0,
  };
};

export const createCampaignRequestService = async (
  userId: number,
  reason: string,
) => {
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new ApiError(400, "Reason is required");
  }

  const charityProfile = await getCharityProfile(userId);

  const existingPending = await prisma.campaignRequest.findFirst({
    where: {
      charityId: charityProfile.id,
      status: "PENDING",
    },
    select: { id: true },
  });

  if (existingPending) {
    throw new ApiError(409, "You already have a pending campaign request.");
  }

  const summary = await getCharityCampaignRequestSummary(userId);

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.campaignRequest.create({
      data: {
        charityId: charityProfile.id,
        reason: trimmedReason,
        status: "PENDING",
        monthCampaignCount: summary.currentMonthCampaignCount,
        totalCampaignCount: summary.totalCampaignCount,
        activeCampaignCount: summary.activeCampaignCount,
      },
      select: campaignRequestSelect,
    });

    if (admins.length > 0) {
      await createBulkNotifications(
        admins.map((admin) => ({
          userId: admin.id,
          title: "Campaign limit request",
          message: `${charityProfile.organizationName} requested approval for an extra campaign.`,
          type: "CAMPAIGN",
          metadata: {
            requestId: created.id,
            charityId: charityProfile.id,
            charityName: charityProfile.organizationName,
          },
        })) as NotificationInput[],
        tx,
      );
    }

    return created;
  });

  return toCampaignRequest(request);
};

export const getMyCampaignRequestsService = async (
  userId: number,
  options: { page: number; limit: number } = { page: 1, limit: 10 },
) => {
  const charityProfile = await getCharityProfile(userId);
  const { page, limit } = options;
  const summary = await getCharityCampaignRequestSummary(userId);

  const where = { charityId: charityProfile.id };

  const [items, total, statusGroups] = await Promise.all([
    prisma.campaignRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: campaignRequestSelect,
    }),
    prisma.campaignRequest.count({ where }),
    prisma.campaignRequest.groupBy({
      where,
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
      CampaignRequestStatus,
      number
    >,
  );

  return {
    summary,
    items: items.map(toCampaignRequest),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
  };
};

export const getAdminCampaignRequestsService = async (options: {
  page: number;
  limit: number;
  search?: string;
  status?: CampaignRequestStatus;
  sortOrder?: "asc" | "desc";
}) => {
  const { page, limit, search, status, sortOrder } = options;

  const where: Prisma.CampaignRequestWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { reason: { contains: search } },
            { charity: { organizationName: { contains: search } } },
            { charity: { user: { name: { contains: search } } } },
            { charity: { user: { email: { contains: search } } } },
          ],
        }
      : {}),
  };

  const [items, total, statusGroups] = await Promise.all([
    prisma.campaignRequest.findMany({
      where,
      orderBy: { requestedAt: sortOrder || "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: campaignRequestSelect,
    }),
    prisma.campaignRequest.count({ where }),
    prisma.campaignRequest.groupBy({
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
      CampaignRequestStatus,
      number
    >,
  );

  return {
    items: items.map(toCampaignRequest),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
  };
};

export const reviewCampaignRequestService = async (
  adminId: number,
  requestId: number,
  action: "APPROVE" | "REJECT",
) => {
  const request = await prisma.campaignRequest.findUnique({
    where: { id: requestId },
    select: campaignRequestSelect,
  });

  if (!request) {
    throw new ApiError(404, "Campaign request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(409, "This request has already been reviewed");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const nextStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const reviewed = await tx.campaignRequest.update({
      where: { id: requestId },
      data: {
        status: nextStatus,
        reviewedAt: new Date(),
        reviewedById: adminId,
      },
      select: campaignRequestSelect,
    });

    await createNotification(
      {
        userId: request.charity.userId,
        title:
          action === "APPROVE"
            ? "Campaign request approved"
            : "Campaign request rejected",
        message:
          action === "APPROVE"
            ? `Your campaign request for ${request.charity.organizationName} was approved. You can create one more campaign.`
            : `Your campaign request for ${request.charity.organizationName} was rejected.`,
        type: "CAMPAIGN",
        metadata: {
          requestId: reviewed.id,
          status: nextStatus,
          charityId: request.charityId,
        },
      },
      tx,
    );

    return reviewed;
  });

  return toCampaignRequest(updated);
};

export const getApprovedAllowanceForCharity = async (
  charityId: number,
  db: DbClient = prisma,
) => {
  return db.campaignRequest.findFirst({
    where: {
      charityId,
      status: "APPROVED",
      consumedAt: null,
    },
    orderBy: { requestedAt: "asc" },
    select: { id: true },
  });
};

export const consumeApprovedCampaignRequest = async (
  db: DbClient,
  requestId: number,
  campaignId: number,
) => {
  await db.campaignRequest.update({
    where: { id: requestId },
    data: {
      consumedAt: new Date(),
      consumedCampaignId: campaignId,
    },
  });
};
