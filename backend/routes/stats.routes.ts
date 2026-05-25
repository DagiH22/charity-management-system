import { Router } from "express";
import { getPlatformStats } from "../controllers/stats.controller";

const statsRouter = Router();

// Public endpoint — no auth required
statsRouter.get("/platform", getPlatformStats);

export default statsRouter;
