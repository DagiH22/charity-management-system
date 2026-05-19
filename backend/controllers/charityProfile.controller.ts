import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  approveCharityProfile,
  createCharityProfile,
  getMyCharityProfile,
  getPendingCharityProfiles,
  updateMyCharityProfile,
} from "../services/charityProfile.service";
import { uploadFile } from "../services/file.service";

type UploadedFile = {
  filename: string;
  size: number;
};

type CharityProfileFiles = {
  document?: UploadedFile[];
  logo?: UploadedFile[];
};

export const createMyCharityProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const requestWithFiles = req as Request & { files?: CharityProfileFiles };
    const maxLogoSize = 5 * 1024 * 1024;

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

    const documentFile = requestWithFiles.files?.document?.[0];
    const logoFile = requestWithFiles.files?.logo?.[0];

    if (logoFile && logoFile.size > maxLogoSize) {
      throw new ApiError(400, "Logo image must be under 5MB.");
    }
    const documentUrl = uploadFile(documentFile, "Document file is required");
    const logoUrl = logoFile
      ? uploadFile(logoFile, "Logo image is required")
      : null;

    const profile = await createCharityProfile({
      userId: req.user.id,
      organizationName,
      description,
      documentUrl,
      logoUrl,
      phone,
      address,
      website,
    });

    res.status(201).json({
      success: true,
      message: "Charity profile created successfully",
      profile,
    });
  },
);

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const profile = await getMyCharityProfile(req.user.id);

    res.status(200).json({
      success: true,
      profile,
    });
  },
);

export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
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
      removeLogo?: string;
    };
    const removeLogo = body.removeLogo === "true";
    const logoUrl = requestWithFile.file
      ? uploadFile(requestWithFile.file, "Logo image is required")
      : removeLogo
        ? null
        : undefined;

    const profile = await updateMyCharityProfile({
      userId: req.user.id,
      organizationName: body.organizationName,
      description: body.description,
      phone: body.phone,
      address: body.address,
      website: body.website,
      logoUrl,
    });

    res.status(200).json({
      success: true,
      profile,
    });
  },
);

export const getPendingProfiles = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      throw new ApiError(
        403,
        "Forbidden: only admin can review pending profiles",
      );
    }

    const profiles = await getPendingCharityProfiles();

    res.status(200).json({
      success: true,
      profiles,
    });
  },
);

export const approveProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden: only admin can approve profiles");
    }

    const profileId = Number(req.params.profileId);

    if (!Number.isInteger(profileId) || profileId <= 0) {
      throw new ApiError(400, "Invalid profile id");
    }

    const profile = await approveCharityProfile(profileId);

    res.status(200).json({
      success: true,
      message: "Charity profile approved successfully",
      profile,
    });
  },
);
