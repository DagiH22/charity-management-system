import { jsPDF } from "jspdf";

export type ReceiptPDFData = {
  receiptReference: string;
  issuedDate: string;
  donorName: string;
  donorEmail?: string | null;
  donationAmount: number;
  donationDate: string;
  campaignTitle: string;
  charityName: string;
  paymentStatus: string;
  paymentMethod?: string;
  isAnonymous?: boolean;
};

const formatReadableDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const addDivider = (doc: jsPDF, left: number, right: number, y: number) => {
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(left, y, right, y);
};

export const generateReceiptPDF = (receiptData: ReceiptPDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 18;
  const right = pageWidth - 18;
  const valueX = 64;
  let y = 20;

  doc.setTextColor(15, 23, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CHARITY MANAGEMENT SYSTEM", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(13);
  doc.text("Donation Receipt", pageWidth / 2, y, { align: "center" });
  y += 7;

  addDivider(doc, left, right, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(receiptData.receiptReference, valueX, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Issued Date:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatReadableDate(receiptData.issuedDate), valueX, y);
  y += 8;

  addDivider(doc, left, right, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DONOR INFORMATION", left, y);
  y += 8;

  const drawField = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, left, y);
    doc.setFont("helvetica", "normal");

    const wrapped = doc.splitTextToSize(value, right - valueX);
    doc.text(wrapped, valueX, y);
    y += Math.max(6, wrapped.length * 5.5);
  };

  drawField("Name", receiptData.isAnonymous ? "Anonymous" : receiptData.donorName);

  if (!receiptData.isAnonymous && receiptData.donorEmail) {
    drawField("Email", receiptData.donorEmail);
  }

  y += 2;
  addDivider(doc, left, right, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DONATION DETAILS", left, y);
  y += 8;

  drawField("Campaign", receiptData.campaignTitle);
  drawField("Charity", receiptData.charityName);
  drawField("Amount", `ETB ${receiptData.donationAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  drawField("Date", formatReadableDate(receiptData.donationDate));
  drawField("Status", receiptData.paymentStatus);

  y += 4;
  addDivider(doc, left, right, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Thank you for your generous donation!", pageWidth / 2, y, {
    align: "center",
  });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Your contribution makes a difference.", pageWidth / 2, y, {
    align: "center",
  });

  doc.save(`donation-receipt-${receiptData.receiptReference}.pdf`);

  return doc;
};
