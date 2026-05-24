import { Router } from "express";
import {
	getDonationByTxRef,
	getDonationReceipt,
} from "../controllers/donation.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:donationId/receipt", protect, authorize("DONOR"), getDonationReceipt);
// Public lookup of donation by transaction reference
router.get("/:txRef", getDonationByTxRef);

export default router;
