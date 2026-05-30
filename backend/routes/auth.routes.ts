import { Router } from "express";
import {
  forgotUserPassword,
  getMyProfile,
  getMe,
  login,
  logout,
  register,
  resetForgottenPassword,
  resetUserPassword,
  updateMyProfile,
  verifyPasswordResetCode,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { imageUpload } from "../middlewares/upload.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotUserPassword);
authRouter.post("/verify-otp", verifyPasswordResetCode);
authRouter.post("/reset-password", resetForgottenPassword);
authRouter.get("/me", protect, getMe);
authRouter.get("/profile", protect, getMyProfile);
authRouter.put(
  "/profile",
  protect,
  imageUpload.single("profileImage"),
  updateMyProfile,
);
authRouter.patch("/reset-password", protect, resetUserPassword);

export default authRouter;
