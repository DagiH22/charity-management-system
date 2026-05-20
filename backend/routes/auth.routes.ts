import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getMe);

export default authRouter;
