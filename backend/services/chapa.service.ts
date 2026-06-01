import { Prisma } from "@prisma/client";
import { randomUUID, createHmac } from "node:crypto";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";
import { createBulkNotifications } from "./notification.service";
import type { NotificationInput } from "./notification.service";
import { env } from "../utils/env";
import { ensureDonationReceipt } from "./donationReceipt.service";

type DonationCheckoutPayload = {
  campaignId: number;
  donorId?: number; // Optional for guests
  donorName: string;
  donorEmail: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  returnUrl?: string;
  callbackUrl: string;
};

type ChapaHostedCheckoutFields = {
  public_key: string;
  tx_ref: string;
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  title: string;
  description: string;
  callback_url: string;
  return_url: string;
  meta?: string;
};

type DonationSummary = {
  id: number;
  donorId: number | null;
  guestName: string | null;
  guestEmail: string | null;
  campaignId: number;
  amount: string;
  isAnonymous: boolean;
  message: string | null;
  transactionId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  donatedAt: Date;
};

type DonationCheckoutResponse = {
  donation: DonationSummary;
  chapa: {
    actionUrl: string;
    fields: ChapaHostedCheckoutFields;
  };
};

type ParsedChapaWebhookPayload = {
  status: string;
  amount: number;
  txRef: string;
  meta: ChapaDonationMeta;
  customerEmail?: string;
};

type ChapaDonationMeta = {
  campaignId?: number;
  isAnonymous?: boolean;
  message?: string | null;
  returnUrl?: string;
};

const CHAPA_INITIALIZE_URL = "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify";
const DEFAULT_RETURN_ORIGIN =
  env.FRONTEND_URLS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0] ?? "http://localhost:5173";

const donationSelect = {
  id: true,
  donorId: true,
  guestName: true,
  guestEmail: true,
  campaignId: true,
  amount: true,
  isAnonymous: true,
  message: true,
  transactionId: true,
  status: true,
  donatedAt: true,
} as const;

const toDonationSummary = (
  donation: Awaited<ReturnType<typeof prisma.donation.create>>,
): DonationSummary => ({
  id: donation.id,
  donorId: donation.donorId,
  guestName: donation.guestName,
  guestEmail: donation.guestEmail,
  campaignId: donation.campaignId,
  amount: donation.amount.toString(),
  isAnonymous: donation.isAnonymous,
  message: donation.message,
  transactionId: donation.transactionId,
  status: donation.status,
  donatedAt: donation.donatedAt,
});

const buildTxRef = () => `DON-${Date.now()}-${randomUUID().slice(0, 12)}`;

const splitName = (fullName: string) => {
  const sanitized = fullName.trim().replace(/\s+/g, " ");

  if (!sanitized) {
    return { firstName: "Donor", lastName: "" };
  }

  const parts = sanitized.split(" ");
  return {
    firstName: parts[0] ?? "Donor",
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeEmail = (email?: string) => {
  const normalized = email?.trim().toLowerCase() || "";

  if (!normalized) {
    return null;
  }

  if (!/^\S+@\S+\.\S+$/.test(normalized)) {
    return null;
  }

  return normalized;
};

const normalizeReturnUrl = (returnUrl?: string) => {
  if (!returnUrl) {
    return DEFAULT_RETURN_ORIGIN;
  }

  try {
    const parsed = new URL(returnUrl);
    const allowedOrigins = env.FRONTEND_URLS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (allowedOrigins.length > 0 && !allowedOrigins.includes(parsed.origin)) {
      return DEFAULT_RETURN_ORIGIN;
    }

    return parsed.toString();
  } catch {
    return DEFAULT_RETURN_ORIGIN;
  }
};

const appendTxRefToReturnUrl = (returnUrl: string, txRef: string) => {
  const parsed = new URL(returnUrl);

  parsed.searchParams.set("tx_ref", txRef);

  return parsed.toString();
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
};

const parseWebhookMeta = (meta: unknown): ChapaDonationMeta => {
  if (!meta) {
    return {};
  }

  const rawMeta =
    typeof meta === "string"
      ? (() => {
          try {
            return JSON.parse(meta) as Record<string, unknown>;
          } catch {
            return {};
          }
        })()
      : meta;

  if (typeof rawMeta !== "object" || Array.isArray(rawMeta)) {
    return {};
  }

  const typedMeta = rawMeta as Record<string, unknown>;

  return {
    campaignId:
      typeof typedMeta.campaignId === "number"
        ? typedMeta.campaignId
        : typeof typedMeta.campaignId === "string"
          ? Number(typedMeta.campaignId)
          : undefined,
    isAnonymous: parseBoolean(typedMeta.isAnonymous),
    message:
      typeof typedMeta.message === "string" && typedMeta.message.trim().length
        ? typedMeta.message.trim()
        : null,
    returnUrl:
      typeof typedMeta.returnUrl === "string" ? typedMeta.returnUrl : undefined,
  };
};

export const createDonationCheckoutService = async (
  payload: DonationCheckoutPayload,
): Promise<{
  donation: DonationSummary;
  chapa: { checkoutUrl: string };
}> => {
  if (!env.CHAPA_SECRET_KEY) {
    console.error("[CHAPA] CHAPA_SECRET_KEY not configured");
    throw new ApiError(500, "CHAPA_SECRET_KEY is not configured");
  }

  if (payload.amount < 10) {
    console.warn("[CHAPA] Amount below minimum", {
      amount: payload.amount,
      donorId: payload.donorId,
    });
    throw new ApiError(400, "Minimum donation is 10 ETB.");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
    include: {
      charity: {
        select: {
          userId: true,
          organizationName: true,
        },
      },
    },
  });

  if (!campaign) {
    console.warn("[CHAPA] Campaign not found", {
      campaignId: payload.campaignId,
    });
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status === "CLOSED") {
    console.warn("[CHAPA] Campaign closed", { campaignId: payload.campaignId });
    throw new ApiError(400, "Cannot donate to a closed campaign");
  }

  const txRef = buildTxRef();
  const amount = new Prisma.Decimal(payload.amount);
  const trimmedMessage = payload.message?.trim();
  const returnUrl = appendTxRefToReturnUrl(
    normalizeReturnUrl(payload.returnUrl),
    txRef,
  );
  const nameParts = splitName(payload.donorName);
  const donorEmail = normalizeEmail(payload.donorEmail);

  if (!donorEmail) {
    throw new ApiError(
      400,
      "A valid donor email is required to initialize Chapa payment.",
    );
  }

  const donation = await prisma.donation.create({
    data: {
      donorId: payload.donorId,
      guestName: !payload.donorId ? payload.donorName : null,
      guestEmail: !payload.donorId ? payload.donorEmail : null,
      campaignId: campaign.id,
      amount,
      isAnonymous: payload.isAnonymous,
      message: trimmedMessage || null,
      transactionId: txRef,
      status: "PENDING",
    },
    select: donationSelect,
  });

  const chapaPayload = {
    amount: amount.toFixed(2),
    currency: "ETB",
    email: donorEmail,
    first_name: nameParts.firstName,
    last_name: nameParts.lastName,
    tx_ref: txRef,
    callback_url: payload.callbackUrl,
    return_url: returnUrl,
    "customization[title]": `Donation for ${campaign.title}`,
    "customization[description]": `Donation to ${campaign.charity.organizationName}`,
    meta: {
      campaignId: campaign.id,
      isAnonymous: payload.isAnonymous,
      message: trimmedMessage || null,
      returnUrl: normalizeReturnUrl(payload.returnUrl),
    },
  };

  const response = await fetch(CHAPA_INITIALIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chapaPayload),
  });

  const responseData = (await response.json()) as any;

  if (!response.ok || responseData.status !== "success") {
    console.error("[CHAPA] Transaction initialize failed", responseData);
    throw new ApiError(500, "Failed to initialize payment with Chapa.");
  }

  return {
    donation: toDonationSummary(donation),
    chapa: {
      checkoutUrl: responseData.data.checkout_url,
    },
  };
};

export const finalizeDonationFromChapaWebhook = async (payload: unknown) => {
  const normalized = normalizeChapaWebhookPayload(payload);

  if (normalized.status !== "success") {
    return {
      handled: false,
      reason: `Ignoring non-success status (${normalized.status})`,
    };
  }

  const existingDonation = await prisma.donation.findFirst({
    where: { transactionId: normalized.txRef },
    select: donationSelect,
  });

  if (existingDonation?.status === "COMPLETED") {
    const receipt = await ensureDonationReceipt(existingDonation.id, prisma);

    return {
      handled: true,
      alreadyCompleted: true,
      donation: toDonationSummary(existingDonation),
      receipt,
    };
  }

  const existingAmount = existingDonation
    ? Number(existingDonation.amount.toString())
    : undefined;

  if (
    existingAmount !== undefined &&
    Math.abs(existingAmount - normalized.amount) > 0.0001
  ) {
    console.error("[CHAPA-WEBHOOK] Amount mismatch", {
      txRef: normalized.txRef,
      expectedAmount: existingAmount,
      receivedAmount: normalized.amount,
    });
    throw new ApiError(
      400,
      `Donation amount mismatch for tx_ref ${normalized.txRef}`,
    );
  }

  const donorId = existingDonation?.donorId;
  const campaignId = existingDonation?.campaignId ?? normalized.meta.campaignId;

  if (!campaignId) {
    console.error("[CHAPA-WEBHOOK] Unable to resolve donation context", {
      txRef: normalized.txRef,
      hasCampaignId: !!campaignId,
    });
    throw new ApiError(
      400,
      `Unable to resolve donation owner for tx_ref ${normalized.txRef}`,
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      charity: {
        select: {
          userId: true,
          organizationName: true,
        },
      },
    },
  });

  if (!campaign) {
    console.error("[CHAPA-WEBHOOK] Campaign not found", {
      campaignId,
      txRef: normalized.txRef,
    });
    throw new ApiError(404, "Campaign not found");
  }

  return prisma.$transaction(async (tx) => {
    const donation = existingDonation
      ? await tx.donation.update({
          where: { id: existingDonation.id },
          data: {
            amount: new Prisma.Decimal(normalized.amount),
            status: "COMPLETED",
            transactionId: normalized.txRef,
            message: normalized.meta.message ?? existingDonation.message,
            isAnonymous:
              normalized.meta.isAnonymous ?? existingDonation.isAnonymous,
          },
          select: donationSelect,
        })
      : await tx.donation.create({
          data: {
            donorId,
            campaignId,
            amount: new Prisma.Decimal(normalized.amount),
            isAnonymous: normalized.meta.isAnonymous ?? false,
            message: normalized.meta.message || null,
            transactionId: normalized.txRef,
            status: "COMPLETED",
          },
          select: donationSelect,
        });

    const priorCompletedDonation = await tx.donation.findFirst({
      where: {
        campaignId,
        donorId,
        status: "COMPLETED",
        NOT: { id: donation.id },
      },
      select: { id: true },
    });

    const updatedCampaign = await tx.campaign.update({
      where: { id: campaignId },
      data: {
        currentAmount: {
          increment: new Prisma.Decimal(normalized.amount),
        },
        donorCount: {
          increment: priorCompletedDonation ? 0 : 1,
        },
      },
      select: {
        id: true,
        title: true,
        currentAmount: true,
        donorCount: true,
      },
    });

    const notificationsToCreate: NotificationInput[] = [];

    if (donorId) {
      notificationsToCreate.push({
        userId: donorId,
        title: "Donation successful",
        message: `Your donation of ${new Intl.NumberFormat("en-US").format(Number(normalized.amount))} ETB to ${campaign.title} was successful.`,
        type: "DONATION",
        metadata: {
          campaignId,
          donationId: donation.id,
          amount: normalized.amount,
          isAnonymous: normalized.meta.isAnonymous ?? false,
        },
      });
    }

    notificationsToCreate.push({
      userId: campaign.charity.userId,
      title: "New donation received",
      message: `${
        (normalized.meta.isAnonymous ?? false)
          ? "An anonymous donor"
          : "A donor"
      } contributed ${new Intl.NumberFormat("en-US").format(Number(normalized.amount))} ETB to ${campaign.title}.`,
      type: "DONATION",
      metadata: {
        campaignId,
        donationId: donation.id,
        amount: normalized.amount,
        isAnonymous: normalized.meta.isAnonymous ?? false,
        donorId: donorId || null,
      },
    });

    await createBulkNotifications(notificationsToCreate, tx);

    const receipt = await ensureDonationReceipt(donation.id, tx);

    return {
      handled: true,
      alreadyCompleted: false,
      donation,
      campaign: updatedCampaign,
      receipt,
    };
  });
};

export const verifyDonationWithChapa = async (txRef: string) => {
  if (!env.CHAPA_SECRET_KEY) {
    console.error("[CHAPA] CHAPA_SECRET_KEY not configured");
    throw new ApiError(500, "CHAPA_SECRET_KEY is not configured");
  }

  const response = await fetch(
    `${CHAPA_VERIFY_URL}/${encodeURIComponent(txRef)}`,
    {
      headers: {
        Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
      },
    },
  );

  const result = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    console.warn("[CHAPA] Transaction verification failed", {
      txRef,
      status: response.status,
      result,
    });
    return { handled: false, reason: "Chapa verification failed", result };
  }

  return finalizeDonationFromChapaWebhook(result);
};

const normalizeChapaWebhookPayload = (
  payload: unknown,
): ParsedChapaWebhookPayload => {
  const normalizedPayload =
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    (payload as { data?: unknown }).data
      ? ((payload as { data: Record<string, unknown> }).data as Record<
          string,
          unknown
        >)
      : (payload as Record<string, unknown>);

  const status = String(normalizedPayload.status ?? "").toLowerCase();
  const amount = Number(normalizedPayload.amount ?? 0);
  const txRef = String(
    normalizedPayload.tx_ref ?? normalizedPayload.ref_id ?? "",
  ).trim();
  const meta = parseWebhookMeta(normalizedPayload.meta);
  const customerEmail =
    typeof normalizedPayload.email === "string"
      ? normalizedPayload.email
      : typeof normalizedPayload.customer === "object" &&
          normalizedPayload.customer !== null &&
          typeof (normalizedPayload.customer as { email?: unknown }).email ===
            "string"
        ? (normalizedPayload.customer as { email: string }).email
        : undefined;

  if (!txRef) {
    throw new ApiError(400, "Webhook payload is missing tx_ref");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Webhook payload contains an invalid amount");
  }

  return { status, amount, txRef, meta, customerEmail };
};
