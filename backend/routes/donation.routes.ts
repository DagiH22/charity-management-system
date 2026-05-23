import { Router } from "express";
import { getDonationByTxRef } from "../controllers/donation.controller";

const router = Router();

// Public lookup of donation by transaction reference
router.get("/:txRef", getDonationByTxRef);

export default router;
