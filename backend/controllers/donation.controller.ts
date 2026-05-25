import { createHmac, timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  createDonationCheckoutService,
  finalizeDonationFromChapaWebhook,
} from "../services/chapa.service";
import { env } from "../utils/env";
import {
  ensureDonationReceipt,
  getDonationReceiptForDonor,
} from "../services/donationReceipt.service";

const safeCompare = (expected: string, actual?: string) => {
  if (!actual) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
};

export const donateToCampaign = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId = Number(req.params.id);

    if (Number.isNaN(campaignId)) {
      throw new ApiError(400, "Invalid campaign id");
    }

    const { amount, isAnonymous, message, returnUrl, guestName, guestEmail } = req.body as {
      amount?: number | string;
      isAnonymous?: boolean;
      message?: string;
      returnUrl?: string;
      guestName?: string;
      guestEmail?: string;
    };

    if (!amount || Number(amount) <= 0) {
      throw new ApiError(400, "Invalid donation amount");
    }

    if (!req.user && (!guestName || !guestEmail)) {
      throw new ApiError(400, "Guest name and email are required for unauthenticated donations");
    }

    const donorInfo = req.user
      ? {
          donorId: req.user.id,
          donorName: req.user.name,
          donorEmail: req.user.email,
        }
      : {
          donorId: undefined,
          donorName: guestName!,
          donorEmail: guestEmail!,
        };

    const checkout = await createDonationCheckoutService({
      campaignId,
      amount: Number(amount),
      ...donorInfo,
      isAnonymous: Boolean(isAnonymous),
      message,
      returnUrl,
      callbackUrl: `${req.protocol}://${req.get("host")}/api/campaign/chapa/webhook`,
    });

    res.status(201).json({ success: true, data: checkout });
  },
);

export const handleChapaDonationWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    if (!env.CHAPA_SECRET_HASH) {
      throw new ApiError(500, "CHAPA_SECRET_HASH is not configured");
    }

    const chapaSignature = req.header("chapa-signature") ?? undefined;
    const xChapaSignature = req.header("x-chapa-signature") ?? undefined;
    const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
    const expectedSignature = createHmac("sha256", env.CHAPA_SECRET_HASH)
      .update(rawBody)
      .digest("hex");

    if (
      !safeCompare(expectedSignature, chapaSignature) &&
      !safeCompare(expectedSignature, xChapaSignature)
    ) {
      throw new ApiError(401, "Invalid Chapa signature");
    }

    const result = await finalizeDonationFromChapaWebhook(req.body);

    if (!result.handled) {
      res.status(200).send("Payment not successful");
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getDonationByTxRef = asyncHandler(
  async (req: Request, res: Response) => {
    const txRef = String(req.params.txRef || "").trim();

    if (!txRef) {
      throw new ApiError(400, "Missing txRef parameter");
    }

    const donation = await (await import("../services/campaign.service")).getDonationByTxRefService(txRef);

    const receipt =
      donation.status === "COMPLETED"
        ? await ensureDonationReceipt(donation.id)
        : null;

    // Mask donor email if anonymous
    const donor = {
      id: donation.donor?.id || null,
      name: donation.isAnonymous 
        ? "Anonymous" 
        : (donation.donor?.name || donation.guestName || "Guest"),
      email: donation.isAnonymous 
        ? null 
        : (donation.donor?.email || donation.guestEmail || null),
    };

    res.status(200).json({ success: true, data: { donation: { ...donation, donor }, receipt } });
  },
);

export const getDonationReceipt = asyncHandler(async (req: Request, res: Response) => {
  const donationId = Number(req.params.donationId);

  if (Number.isNaN(donationId)) {
    throw new ApiError(400, "Invalid donation id");
  }

  // If there's no auth, we can't show a protected receipt here
  // But a guest should be getting it via the webhook/txRef flow.
  if (!req.user) {
    throw new ApiError(401, "Authentication required to view historical receipts");
  }

  const receipt = await getDonationReceiptForDonor(donationId, req.user.id);

  res.status(200).json({ success: true, data: receipt });
});
