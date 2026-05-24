import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  createMyBankAccount,
  deleteMyBankAccount,
  listMyBankAccounts,
  updateMyBankAccount,
} from "../controllers/bankAccount.controller";

const router = Router();

router.get("/me", protect, authorize("CHARITY"), listMyBankAccounts);
router.post("/", protect, authorize("CHARITY"), createMyBankAccount);
router.put("/:accountId", protect, authorize("CHARITY"), updateMyBankAccount);
router.delete("/:accountId", protect, authorize("CHARITY"), deleteMyBankAccount);

export default router;
