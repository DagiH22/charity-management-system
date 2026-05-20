import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  approveProfile,
  createMyCharityProfile,
  getMyProfile,
  getPendingProfiles,
  updateMyProfile,
} from "../controllers/charityProfile.controller";
import { imageUpload, profileUpload } from "../middlewares/upload.middleware";

const charityProfileRouter = Router();

charityProfileRouter.get(
  "/pending",
  protect,
  authorize("ADMIN"),
  getPendingProfiles,
);
charityProfileRouter.put(
  "/:profileId/approve",
  protect,
  authorize("ADMIN"),
  approveProfile,
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
