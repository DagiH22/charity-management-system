import { Router } from "express";
import {
  getCharityCampaignContributions,
  getCharityCampaigns,
  getCharityContributions,
  getCharityDashboard,
} from "../controllers/charityDashboard.controller";
import {
  authorize,
  protect,
  verifiedCharityOnly,
} from "../middlewares/auth.middleware";

const charityDashboardRouter = Router();

charityDashboardRouter.use(protect, authorize("CHARITY"), verifiedCharityOnly);

charityDashboardRouter.get("/overview", getCharityDashboard);
charityDashboardRouter.get("/campaigns", getCharityCampaigns);
charityDashboardRouter.get("/contributions", getCharityContributions);
charityDashboardRouter.get(
  "/contributions/:campaignId",
  getCharityCampaignContributions,
);

export default charityDashboardRouter;
