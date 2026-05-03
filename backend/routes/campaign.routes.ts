import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { createCampaign } from "../controllers/campaign.controller";

const campaignRouter = Router();

campaignRouter.post(
  "/create",
  protect,
  authorize("CHARITY"),
  createCampaign,
);

export default campaignRouter;
