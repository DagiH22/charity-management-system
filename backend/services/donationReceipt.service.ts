import { Prisma, PrismaClient } from "@prisma/client";
import { randomInt } from "node:crypto";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type DonationReceiptResponse = {
  receiptReference: string;
  issuedDate: string;
  donorName: string;
  donorEmail: string | null;
  donationAmount: number;
  donationDate: string;
  campaignTitle: string;
  charityName: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  donationId: number;
  isAnonymous: boolean;
};

const donationReceiptInclude = {
  donation: {
    include: {
      donor: {
        select: {
          name: true,
          email: true,
        },
      },
      campaign: {
        select: {
          title: true,
          charity: {
            select: {
              organizationName: true,
            },
          },
        },
      },
    },
  },
} as const;

const formatReceiptResponse = (
  receipt: Awaited<ReturnType<DbClient["donationReceipt"]["findUnique"]>> & {
    donation: {
      id: number;
      donorId: number | null;
      guestName: string | null;
      guestEmail: string | null;
      amount: Prisma.Decimal;
      isAnonymous: boolean;
      status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
      donatedAt: Date;
      donor: {
        name: string;
        email: string;
      } | null;
      campaign: {
        title: string;
        charity: {
          organizationName: string;
        };
      };
    };
  },
): DonationReceiptResponse => ({
  receiptReference: receipt.receiptReference,
  issuedDate: receipt.issuedDate.toISOString(),
  donorName: receipt.donation.isAnonymous 
    ? "Anonymous" 
    : (receipt.donation.donor?.name || receipt.donation.guestName || "Guest"),
  donorEmail: receipt.donation.isAnonymous 
    ? null 
    : (receipt.donation.donor?.email || receipt.donation.guestEmail || null),
  donationAmount: Number(receipt.donation.amount.toString()),
  donationDate: receipt.donation.donatedAt.toISOString(),
  campaignTitle: receipt.donation.campaign.title,
  charityName: receipt.donation.campaign.charity.organizationName,
  paymentStatus: receipt.donation.status,
  paymentMethod: "Chapa Payment",
  donationId: receipt.donationId,
  isAnonymous: receipt.donation.isAnonymous,
});

const getReceiptRecord = async (client: DbClient, donationId: number) =>
  client.donationReceipt.findUnique({
    where: { donationId },
    include: donationReceiptInclude,
  });

const getCompletedDonation = async (client: DbClient, donationId: number) =>
  client.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      donorId: true,
      guestName: true,
      guestEmail: true,
      amount: true,
      isAnonymous: true,
      status: true,
      donatedAt: true,
      donor: {
        select: {
          name: true,
          email: true,
        },
      },
      campaign: {
        select: {
          title: true,
          charity: {
            select: {
              organizationName: true,
            },
          },
        },
      },
    },
  });

const buildReceiptReference = () => `REC-${String(randomInt(0, 100000)).padStart(5, "0")}`;

const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "P2002";

export const ensureDonationReceipt = async (
  donationId: number,
  client: DbClient = prisma,
): Promise<DonationReceiptResponse> => {
  const existing = await getReceiptRecord(client, donationId);

  if (existing) {
    return formatReceiptResponse(existing);
  }

  const donation = await getCompletedDonation(client, donationId);

  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  if (donation.status !== "COMPLETED") {
    throw new ApiError(400, "Receipt is only available for completed donations");
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const receiptReference = buildReceiptReference();

    try {
      const created = await client.donationReceipt.create({
        data: {
          donationId,
          receiptReference,
          issuedDate: new Date(),
        },
        include: donationReceiptInclude,
      });

      return formatReceiptResponse(created);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const latest = await getReceiptRecord(client, donationId);

        if (latest) {
          return formatReceiptResponse(latest);
        }

        continue;
      }

      throw error;
    }
  }

  throw new ApiError(500, "Unable to generate a unique receipt reference");
};

export const getDonationReceiptForDonor = async (
  donationId: number,
  donorId: number,
  client: DbClient = prisma,
): Promise<DonationReceiptResponse> => {
  const receipt = await getReceiptRecord(client, donationId);

  if (!receipt) {
    throw new ApiError(404, "Receipt not found");
  }

  if (receipt.donation.donorId !== donorId) {
    throw new ApiError(403, "You are not allowed to access this receipt");
  }

  return formatReceiptResponse(receipt);
};
