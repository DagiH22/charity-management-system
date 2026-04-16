import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
	approveProfile,
	createMyCharityProfile,
	getMyProfile,
	getPendingProfiles,
} from "../controllers/charityProfile.controller";
import { upload } from "../middlewares/upload.middleware";

const charityProfileRouter = Router();

charityProfileRouter.get("/pending", protect, authorize("ADMIN"), getPendingProfiles);
charityProfileRouter.patch("/:profileId/approve", protect, authorize("ADMIN"), approveProfile);

charityProfileRouter.get("/me", protect, authorize("CHARITY"), getMyProfile);
charityProfileRouter.post(
	"/",
	protect,
	authorize("CHARITY"),
	upload.single("document"),
	createMyCharityProfile,
);

export default charityProfileRouter;
