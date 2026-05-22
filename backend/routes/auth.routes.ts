import { Router } from "express";
import {
  forgotUserPassword,
  getMe,
  login,
  logout,
  register,
  resetForgottenPassword,
  resetUserPassword,
  verifyPasswordResetCode,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotUserPassword);
authRouter.post("/verify-otp", verifyPasswordResetCode);
authRouter.post("/reset-password", resetForgottenPassword);
authRouter.get("/me", protect, getMe);
authRouter.patch("/reset-password", protect, resetUserPassword);

export default authRouter;
