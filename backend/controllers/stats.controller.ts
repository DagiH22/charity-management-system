import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getPlatformStatsService } from "../services/stats.service";

export const getPlatformStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await getPlatformStatsService();

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
);
