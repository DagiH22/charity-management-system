import { Router } from "express";
import { authorize, isAdmin, protect } from "../middlewares/auth.middleware";
import {
  approveProfile,
  createMyCharityProfile,
  getMyProfile,
  getPendingProfiles,
  rejectProfile,
  updateMyProfile,
} from "../controllers/charityProfile.controller";
import { imageUpload, profileUpload } from "../middlewares/upload.middleware";

const charityProfileRouter = Router();

charityProfileRouter.get(
  "/pending",
  protect,
  isAdmin,
  getPendingProfiles,
);
charityProfileRouter.put(
  "/:profileId/approve",
  protect,
  isAdmin,
  approveProfile,
);
charityProfileRouter.put(
  "/:profileId/reject",
  protect,
  isAdmin,
  rejectProfile,
);

charityProfileRouter.get("/me", protect, authorize("CHARITY"), getMyProfile);
charityProfileRouter.put(
  "/me",
  protect,
  authorize("CHARITY"),
  imageUpload.single("logo"),
  updateMyProfile,
);
charityProfileRouter.post(
  "/",
  protect,
  authorize("CHARITY"),
  profileUpload.fields([
    { name: "document", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  createMyCharityProfile,
);

export default charityProfileRouter;
