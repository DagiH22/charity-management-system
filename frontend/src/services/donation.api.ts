import { http } from "./httpClient";
import type { ReceiptPDFData } from "../utils/receiptPdf";

export type DonationReceiptResponse = {
  success: true;
  data: ReceiptPDFData;
};

export const getDonationReceipt = async (donationId: number) => {
  const { data } = await http.get<DonationReceiptResponse>(
    `/donations/${donationId}/receipt`,
  );

  return data;
};
