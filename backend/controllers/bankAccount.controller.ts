import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  createBankAccount,
  deleteBankAccount,
  getMyBankAccounts,
  updateBankAccount,
} from "../services/bankAccount.service";

export const listMyBankAccounts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  const accounts = await getMyBankAccounts(req.user.id);
  res.status(200).json({ success: true, accounts });
});

export const createMyBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const body = (req.body ?? {}) as {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    type?: "PERSONAL" | "BUSINESS";
    isPrimary?: string | boolean;
  };

  const account = await createBankAccount(req.user.id, {
    bankName: body.bankName || "",
    accountNumber: body.accountNumber || "",
    accountHolder: body.accountHolder || "",
    type: body.type,
    isPrimary: body.isPrimary === "true" || body.isPrimary === true,
  });

  res.status(201).json({ success: true, account });
});

export const updateMyBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId) || accountId <= 0) throw new ApiError(400, "Invalid account id");

  const body = (req.body ?? {}) as {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    type?: "PERSONAL" | "BUSINESS";
    isPrimary?: string | boolean;
  };

  const account = await updateBankAccount(req.user.id, accountId, {
    bankName: body.bankName,
    accountNumber: body.accountNumber,
    accountHolder: body.accountHolder,
    type: body.type,
    isPrimary: body.isPrimary === "true" || body.isPrimary === true,
  });

  res.status(200).json({ success: true, account });
});

export const deleteMyBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const accountId = Number(req.params.accountId);
  if (!Number.isInteger(accountId) || accountId <= 0) throw new ApiError(400, "Invalid account id");

  await deleteBankAccount(req.user.id, accountId);
  res.status(200).json({ success: true, message: "Bank account deleted" });
});
