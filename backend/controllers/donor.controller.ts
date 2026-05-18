import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getDonorDashboardService,
  getDonorDonationsService,
  getDonorAnonymousDonationsService,
  getDonorFollowingCampaignsService,
  toggleFollowCampaignService,
} from "../services/donor.service";

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

export const getDonorAnonymousDonations = asyncHandler(
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

    const donations = await getDonorAnonymousDonationsService(req.user!.id, {
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
    const status = req.query.status
      ? (String(req.query.status) as "ACTIVE" | "CLOSED" | "DRAFT")
      : undefined;
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const campaigns = await getDonorFollowingCampaignsService(req.user!.id, {
      page,
      limit,
      search,
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
