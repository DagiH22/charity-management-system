import { http } from "./httpClient";

export const getMyBankAccountsRequest = async () => {
  const { data } = await http.get("/bank-accounts/me");
  return data as { success: true; accounts: any[] };
};

export const createBankAccountRequest = async (payload: {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type?: "PERSONAL" | "BUSINESS";
  isPrimary?: boolean;
}) => {
  const { data } = await http.post("/bank-accounts", payload);
  return data as { success: true; account: any };
};

export const updateBankAccountRequest = async (
  accountId: number,
  payload: Partial<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    type: "PERSONAL" | "BUSINESS";
    isPrimary: boolean;
  }>,
) => {
  const { data } = await http.put(`/bank-accounts/${accountId}`, payload);
  return data as { success: true; account: any };
};

export const deleteBankAccountRequest = async (accountId: number) => {
  const { data } = await http.delete(`/bank-accounts/${accountId}`);
  return data as { success: true; message: string };
};
