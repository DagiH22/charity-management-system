import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { createCharityProfile, getMyCharityProfile } from "../services/charityProfile.service";
import { uploadFile } from "../services/file.service";

type UploadedFile = {
  filename: string;
};

export const createMyCharityProfile = asyncHandler(async (req: Request, res: Response) => {
  const requestWithFile = req as Request & { file?: UploadedFile };

  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const body = (req.body ?? {}) as {
    organizationName?: string;
    description?: string;
    phone?: string;
    address?: string;
    website?: string;
  };

  const { organizationName, description, phone, address, website } = body;

  if (!organizationName || !description) {
    throw new ApiError(400, "organizationName and description are required");
  }

  const documentUrl = uploadFile(requestWithFile.file);

  const profile = await createCharityProfile({
    userId: req.user.id,
    organizationName,
    description,
    documentUrl,
    phone,
    address,
    website,
  });

  res.status(201).json({
    success: true,
    message: "Charity profile created successfully",
    profile,
  });
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const profile = await getMyCharityProfile(req.user.id);

  res.status(200).json({
    success: true,
    profile,
  });
});
