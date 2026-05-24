import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export const getMyBankAccounts = async (userId: number) => {
  return prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { isPrimary: "desc", createdAt: "desc" },
  });
};

export const createBankAccount = async (
  userId: number,
  payload: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type?: "PERSONAL" | "BUSINESS";
    isPrimary?: boolean;
  },
) => {
  if (!payload.bankName || !payload.accountNumber || !payload.accountHolder) {
    throw new ApiError(400, "bankName, accountNumber and accountHolder are required");
  }

  if (payload.isPrimary) {
    // unset other primary accounts
    await prisma.bankAccount.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.bankAccount.create({
    data: {
      userId,
      bankName: payload.bankName.trim(),
      accountNumber: payload.accountNumber.trim(),
      accountHolder: payload.accountHolder.trim(),
      type: payload.type ?? "PERSONAL",
      isPrimary: !!payload.isPrimary,
    },
  });
};

export const updateBankAccount = async (
  userId: number,
  accountId: number,
  payload: Partial<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type: "PERSONAL" | "BUSINESS";
    isPrimary: boolean;
  }>,
) => {
  const existing = await prisma.bankAccount.findUnique({ where: { id: accountId } });
  if (!existing || existing.userId !== userId) {
    throw new ApiError(404, "Bank account not found");
  }

  if (payload.isPrimary) {
    await prisma.bankAccount.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } });
  }

  return prisma.bankAccount.update({
    where: { id: accountId },
    data: {
      ...(payload.bankName !== undefined ? { bankName: payload.bankName.trim() } : {}),
      ...(payload.accountNumber !== undefined ? { accountNumber: payload.accountNumber.trim() } : {}),
      ...(payload.accountHolder !== undefined ? { accountHolder: payload.accountHolder.trim() } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.isPrimary !== undefined ? { isPrimary: payload.isPrimary } : {}),
    },
  });
};

export const deleteBankAccount = async (userId: number, accountId: number) => {
  const existing = await prisma.bankAccount.findUnique({ where: { id: accountId } });
  if (!existing || existing.userId !== userId) {
    throw new ApiError(404, "Bank account not found");
  }

  await prisma.bankAccount.delete({ where: { id: accountId } });
  return { deleted: true };
};
