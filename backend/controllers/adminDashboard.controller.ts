import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getAdminCampaignOversightService,
  getAdminCharityVerificationsService,
  getAdminDonationLogsService,
  getAdminOverviewService,
  getAdminReportsService,
  getAdminUsersService,
  toggleUserSuspensionService,
} from "../services/adminDashboard.service";
import { CampaignLocation } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const getAdminOverview = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await getAdminOverviewService();
    res.status(200).json({ success: true, data });
  },
);

export const getAdminUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const search = req.query.search ? String(req.query.search) : undefined;
    const role = req.query.role
      ? (String(req.query.role) as "DONOR" | "CHARITY" | "ADMIN")
      : undefined;
    const verification = req.query.verification
      ? (String(req.query.verification) as
          | "PENDING"
          | "APPROVED"
          | "REJECTED"
          | "VERIFIED"
          | "UNVERIFIED")
      : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as "createdAt" | "name" | "email")
      : "createdAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const data = await getAdminUsersService({
      page,
      limit,
      search,
      role,
      verification,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, data });
  },
);

export const getAdminCharityVerifications = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 8);
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status
      ? (String(req.query.status) as "PENDING" | "APPROVED" | "REJECTED")
      : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as
          | "createdAt"
          | "organizationName"
          | "updatedAt")
      : "createdAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const data = await getAdminCharityVerificationsService({
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, data });
  },
);

export const getAdminCampaignOversight = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 9);
    const search = req.query.search ? String(req.query.search) : undefined;
    const location = req.query.location
      ? String(req.query.location)
      : undefined;
    const status = req.query.status
      ? (String(req.query.status) as "ACTIVE" | "CLOSED" | "DRAFT")
      : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as
          | "createdAt"
          | "currentAmount"
          | "targetAmount"
          | "donorCount")
      : "createdAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    if (
      location &&
      !Object.values(CampaignLocation).includes(location as CampaignLocation)
    ) {
      throw new ApiError(400, "Invalid campaign location");
    }

    const data = await getAdminCampaignOversightService({
      page,
      limit,
      search,
      location: location as CampaignLocation | undefined,
      status,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, data });
  },
);

export const getAdminDonationLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 15);
    const search = req.query.search ? String(req.query.search) : undefined;
    const campaignId = req.query.campaignId
      ? Number(req.query.campaignId)
      : undefined;
    const anonymous = req.query.anonymous
      ? String(req.query.anonymous) === "true"
      : undefined;
    const status = req.query.status
      ? (String(req.query.status) as
          | "PENDING"
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED")
      : undefined;
    const dateFrom = req.query.dateFrom
      ? String(req.query.dateFrom)
      : undefined;
    const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as "donatedAt" | "amount" | "status")
      : "donatedAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const data = await getAdminDonationLogsService({
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
    });

    res.status(200).json({ success: true, data });
  },
);

export const getAdminReports = asyncHandler(
  async (req: Request, res: Response) => {
    const dateFrom = req.query.dateFrom
      ? String(req.query.dateFrom)
      : undefined;
    const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;

    const data = await getAdminReportsService({ dateFrom, dateTo });

    res.status(200).json({ success: true, data });
  },
);

export const toggleUserSuspension = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const data = await toggleUserSuspensionService(userId);

    res.status(200).json({ success: true, data });
  },
);
