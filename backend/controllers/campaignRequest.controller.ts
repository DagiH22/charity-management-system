import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCampaignRequestService,
  getAdminCampaignRequestsService,
  getMyCampaignRequestsService,
  reviewCampaignRequestService,
} from "../services/campaignRequest.service";

export const createCampaignRequest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role !== "CHARITY") {
      throw new ApiError(403, "Only charity accounts can create campaign requests");
    }

    const body = (req.body ?? {}) as { reason?: string };
    const request = await createCampaignRequestService(
      req.user.id,
      body.reason || "",
    );

    res.status(201).json({
      success: true,
      data: request,
    });
  },
);

export const getMyCampaignRequests = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role !== "CHARITY") {
      throw new ApiError(403, "Only charity accounts can view campaign requests");
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await getMyCampaignRequestsService(req.user.id, { page, limit });

    res.status(200).json({
      success: true,
      data,
    });
  },
);

export const getAdminCampaignRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status
      ? (String(req.query.status) as "PENDING" | "APPROVED" | "REJECTED")
      : undefined;
    const sortOrder = req.query.sortOrder
      ? (String(req.query.sortOrder) as "asc" | "desc")
      : "desc";

    const data = await getAdminCampaignRequestsService({
      page,
      limit,
      search,
      status,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data,
    });
  },
);

export const approveCampaignRequest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      throw new ApiError(400, "Invalid request id");
    }

    const updated = await reviewCampaignRequestService(
      req.user.id,
      requestId,
      "APPROVE",
    );

    res.status(200).json({
      success: true,
      message: "Campaign request approved",
      data: updated,
    });
  },
);

export const rejectCampaignRequest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      throw new ApiError(400, "Invalid request id");
    }

    const updated = await reviewCampaignRequestService(
      req.user.id,
      requestId,
      "REJECT",
    );

    res.status(200).json({
      success: true,
      message: "Campaign request rejected",
      data: updated,
    });
  },
);
