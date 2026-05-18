import { Router } from "express";
import {
  authorize,
  protect,
  verifiedCharityOnly,
} from "../middlewares/auth.middleware";
import {
  closeCampaign,
  createCampaign,
  getCampaignById,
  getMyCampaigns,
  updateCampaign,
  getAllCampaigns,
  getFeaturedCampaigns,
  getPublicCampaignById,
} from "../controllers/campaign.controller";
import { donateToCampaign } from "../controllers/donation.controller";

const campaignRouter = Router();

campaignRouter.get("/all", getAllCampaigns);
campaignRouter.get("/featured", getFeaturedCampaigns);
campaignRouter.get(
  "/my-campaigns",
  protect,
  authorize("CHARITY"),
  verifiedCharityOnly,
  getMyCampaigns,
);
// Public campaign detail (no auth) - used by frontend for viewing and donations
campaignRouter.get("/public/:id", getPublicCampaignById);
// Charity-only campaign detail (internal editing)
campaignRouter.get(
  "/:id",
  protect,
  authorize("CHARITY"),
  verifiedCharityOnly,
  getCampaignById,
);
campaignRouter.post(
  "/create",
  protect,
  authorize("CHARITY"),
  verifiedCharityOnly,
  createCampaign,
);
campaignRouter.put(
  "/:id",
  protect,
  authorize("CHARITY"),
  verifiedCharityOnly,
  updateCampaign,
);
campaignRouter.put(
  "/:id/close",
  protect,
  authorize("CHARITY"),
  verifiedCharityOnly,
  closeCampaign,
);
// Donation endpoint (requires donor auth)
campaignRouter.post(
  "/:id/donate",
  protect,
  authorize("DONOR"),
  donateToCampaign,
);

export default campaignRouter;
