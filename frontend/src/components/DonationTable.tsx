import { Download } from "lucide-react";
import formatCurrency from "../utils/format";

export type DonationItem = {
  id: number;
  amount: number;
  donatedAt: string;
  status: string;
  isAnonymous: boolean;
  transactionId?: string | null;
  campaign: {
    id: number;
    title: string;
  };
};

type DonationTableProps = {
  items: DonationItem[];
  forceAnonymousBadge?: boolean;
  onDownloadReceipt?: (donationId: number) => void;
  downloadingId?: number | null;
};

export const DonationTable = ({
  items,
  forceAnonymousBadge = false,
  onDownloadReceipt,
  downloadingId = null,
}: DonationTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="px-6 py-3">Campaign</th>
          <th className="px-6 py-3">Amount</th>
          <th className="px-6 py-3">Date</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Transaction</th>
          {onDownloadReceipt && <th className="px-6 py-3">Receipt</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((donation) => {
          const isCompleted =
            String(donation.status).toUpperCase() === "COMPLETED";
          const isDownloading = downloadingId === donation.id;

          return (
            <tr key={donation.id} className="border-t border-slate-100">
              <td className="px-6 py-4 font-semibold text-[#0b2b53]">
                {donation.campaign.title}
              </td>
              <td className="px-6 py-4 text-emerald-600 font-bold">
                {formatCurrency(Number(donation.amount))} ETB
              </td>
              <td className="px-6 py-4 text-slate-500">
                {new Date(donation.donatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {donation.status}
                </span>
                {(forceAnonymousBadge || donation.isAnonymous) && (
                  <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    Anonymous
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-500">
                {donation.transactionId || "—"}
              </td>
              {onDownloadReceipt && (
                <td className="px-6 py-4">
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => onDownloadReceipt(donation.id)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? "Downloading..." : "Download"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Unavailable</span>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
