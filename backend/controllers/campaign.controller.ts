import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "../validators/campaign.validator";
import {
  updateCampaignService,
  closeCampaignService,
  getCampaignByIdService,
  createCampaignService,
  getMyCampaignsService,
  getAllCampaignsService,
  getFeaturedCampaignsService,
  getPublicCampaignByIdService,
} from "../services/campaign.service";

export const getPublicCampaignById = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);

    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const campaign = await getPublicCampaignByIdService(campaignId);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  },
);

export const getCampaignById = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);

    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const campaign = await getCampaignByIdService(req.user!.id, campaignId);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  },
);

export const createCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createCampaignSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "Validation failed");
    }

    const campaign = await createCampaignService(req.user!.id, result.data);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  },
);

export const getMyCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const campaigns = await getMyCampaignsService(req.user!.id);

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  },
);

export const updateCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);

    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const result = updateCampaignSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "Validation failed");
    }

    const updatedCampaign = await updateCampaignService(
      req.user!.id,
      campaignId,
      result.data,
    );

    res.status(200).json({
      success: true,
      data: updatedCampaign,
    });
  },
);

export const closeCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);

    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const campaign = await closeCampaignService(req.user!.id, campaignId);

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Campaign closed successfully",
    });
  },
);

export const getAllCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const campaigns = await getAllCampaignsService();

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  },
);

export const getFeaturedCampaigns = asyncHandler(
  async (req: Request, res: Response) => {
    const campaigns = await getFeaturedCampaignsService();

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  },
);
