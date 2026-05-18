import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.middleware";
import {
  getDonorDashboard,
  getDonorDonations,
  getDonorAnonymousDonations,
  getDonorFollowingCampaigns,
  toggleFollowCampaign,
} from "../controllers/donor.controller";

const donorRouter = Router();

// Dashboard aggregation endpoint
donorRouter.get("/dashboard", protect, authorize("DONOR"), getDonorDashboard);

// Full list pages
donorRouter.get("/donations", protect, authorize("DONOR"), getDonorDonations);
donorRouter.get(
  "/anonymous-donations",
  protect,
  authorize("DONOR"),
  getDonorAnonymousDonations,
);
donorRouter.get(
  "/following",
  protect,
  authorize("DONOR"),
  getDonorFollowingCampaigns,
);

// Interactions
donorRouter.post(
  "/campaign/:id/follow",
  protect,
  authorize("DONOR"),
  toggleFollowCampaign,
);

export default donorRouter;
