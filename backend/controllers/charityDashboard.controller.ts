import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  getCharityDashboardService,
  getCharityCampaignsService,
  getCharityContributionsService,
  getCharityCampaignContributionsService,
} from "../services/charityDashboard.service";

export const getCharityDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getCharityDashboardService(req.user!.id);
    res.status(200).json({ success: true, data });
  },
);

export const getCharityCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status
      ? (String(req.query.status) as "ACTIVE" | "CLOSED" | "DRAFT")
      : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as
          | "createdAt"
          | "currentAmount"
          | "targetAmount"
          | "donorCount"
          | "endDate"
          | "title")
      : "createdAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const data = await getCharityCampaignsService(req.user!.id, {
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

export const getCharityContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 6);
    const donationLimit = Number(req.query.donationLimit || 4);
    const search = req.query.search ? String(req.query.search) : undefined;
    const campaignId = req.query.campaignId
      ? Number(req.query.campaignId)
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

    const data = await getCharityContributionsService(req.user!.id, {
      page,
      limit,
      donationLimit,
      search,
      campaignId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, data });
  },
);

export const getCharityCampaignContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.campaignId);
    if (!Number.isFinite(campaignId) || campaignId <= 0) {
      throw new ApiError(400, "Invalid campaign id");
    }
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 8);
    const search = req.query.search ? String(req.query.search) : undefined;
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

    const data = await getCharityCampaignContributionsService(
      req.user!.id,
      campaignId,
      {
        page,
        limit,
        search,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
    );

    res.status(200).json({ success: true, data });
  },
);
