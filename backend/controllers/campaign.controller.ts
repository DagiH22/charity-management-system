import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createCampaignService } from "../services/campaign.service";
import { createCampaignSchema } from "../validators/campaign.validator";

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
  }
);