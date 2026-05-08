import { Router } from "express";
import { authorize, protect, verifiedCharityOnly } from "../middlewares/auth.middleware";
import { closeCampaign, createCampaign, getCampaignById, getMyCampaigns, updateCampaign, getAllCampaigns, getFeaturedCampaigns } from "../controllers/campaign.controller";

const campaignRouter = Router();

campaignRouter.get("/all", getAllCampaigns);
campaignRouter.get("/featured", getFeaturedCampaigns);
campaignRouter.get("/my-campaigns", protect, authorize("CHARITY"), verifiedCharityOnly,getMyCampaigns);
campaignRouter.get("/:id", protect, authorize("CHARITY"),  verifiedCharityOnly, getCampaignById);
campaignRouter.post("/create", protect, authorize("CHARITY"), verifiedCharityOnly, createCampaign);
campaignRouter.put("/:id", protect, authorize("CHARITY"), verifiedCharityOnly,updateCampaign);
campaignRouter.put("/:id/close", protect, authorize("CHARITY"), verifiedCharityOnly, closeCampaign);

export default campaignRouter;

