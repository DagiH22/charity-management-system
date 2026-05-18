import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { donateToCampaignService } from "../services/campaign.service";

export const donateToCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);
    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const { amount, isAnonymous, message } = req.body;

    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, "Invalid donation amount");
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication required to donate");
    }

    const donorId = req.user.id;

    const { donation, campaign } = await donateToCampaignService(
      campaignId,
      Number(amount),
      donorId,
      Boolean(isAnonymous),
      message,
    );

    res.status(201).json({ success: true, data: { donation, campaign } });
  },
);
