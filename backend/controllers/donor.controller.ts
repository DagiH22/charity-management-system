import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getDonorDashboardService,
  getDonorDonationsService,
  getDonorAnonymoETBonationsService,
  getDonorFollowingCampaignsService,
  toggleFollowCampaignService,
} from "../services/donor.service";
import { CampaignLocation } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const getDonorDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboardData = await getDonorDashboardService(req.user!.id);
    res.status(200).json({ success: true, data: dashboardData });
  },
);

export const getDonorDonations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as "donatedAt" | "amount" | "status")
      : "donatedAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const donations = await getDonorDonationsService(req.user!.id, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
    res.status(200).json({ success: true, data: donations });
  },
);

export const getDonorAnonymoETBonations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const sortBy = req.query.sortBy
      ? (String(req.query.sortBy) as "donatedAt" | "amount" | "status")
      : "donatedAt";
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const donations = await getDonorAnonymoETBonationsService(req.user!.id, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
    res.status(200).json({ success: true, data: donations });
  },
);

export const getDonorFollowingCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const location = req.query.location
      ? String(req.query.location)
      : undefined;
    const status = req.query.status
      ? (String(req.query.status) as "ACTIVE" | "CLOSED" | "DRAFT")
      : undefined;
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    if (
      location &&
      !Object.values(CampaignLocation).includes(location as CampaignLocation)
    ) {
      throw new ApiError(400, "Invalid campaign location");
    }

    const campaigns = await getDonorFollowingCampaignsService(req.user!.id, {
      page,
      limit,
      search,
      location: location as CampaignLocation | undefined,
      status,
      sortOrder,
    });
    res.status(200).json({ success: true, data: campaigns });
  },
);

export const toggleFollowCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    const result = await toggleFollowCampaignService(req.user!.id, campaignId);
    res.status(200).json({ success: true, ...result });
  },
);
