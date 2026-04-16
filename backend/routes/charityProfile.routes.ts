import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { createMyCharityProfile, getMyProfile } from "../controllers/charityProfile.controller";
import { upload } from "../middlewares/upload.middleware";

const charityProfileRouter = Router();

charityProfileRouter.use(protect, authorize("CHARITY"));

charityProfileRouter.get("/me", getMyProfile);
charityProfileRouter.post("/", upload.single("document"), createMyCharityProfile);

export default charityProfileRouter;
