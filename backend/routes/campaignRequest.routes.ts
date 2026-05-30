import { Router } from "express";
import { authorize, isAdmin, protect } from "../middlewares/auth.middleware";
import {
  approveCampaignRequest,
  createCampaignRequest,
  getAdminCampaignRequests,
  getMyCampaignRequests,
  rejectCampaignRequest,
} from "../controllers/campaignRequest.controller";

const campaignRequestRouter = Router();

campaignRequestRouter.post(
  "/",
  protect,
  authorize("CHARITY"),
  createCampaignRequest,
);
campaignRequestRouter.get(
  "/me",
  protect,
  authorize("CHARITY"),
  getMyCampaignRequests,
);

campaignRequestRouter.get(
  "/admin",
  protect,
  isAdmin,
  getAdminCampaignRequests,
);
campaignRequestRouter.put(
  "/admin/:requestId/approve",
  protect,
  isAdmin,
  approveCampaignRequest,
);
campaignRequestRouter.put(
  "/admin/:requestId/reject",
  protect,
  isAdmin,
  rejectCampaignRequest,
);

export default campaignRequestRouter;
