import { Router } from "express";
import { getMe, login, logout, register, resetUserPassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getMe);
authRouter.patch("/reset-password", protect, resetUserPassword);

export default authRouter;
