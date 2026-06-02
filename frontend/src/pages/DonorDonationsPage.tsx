import { useEffect, useState } from "react";
import { getDonorDonations } from "../services/donor.api";
import { DonationTable } from "../components/DonationTable";
import type { DonationItem } from "../components/DonationTable";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterSelect } from "../components/ui/FilterSelect";
import { getDonationReceipt } from "../services/donation.api";
import { generateReceiptPDF } from "../utils/receiptPdf";

type DonationsResponse = {
  items: DonationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function DonorDonationsPage() {
  const [donations, setDonations] = useState<DonationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"donatedAt" | "amount" | "status">(
    "donatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const result = await getDonorDonations({
          page,
          limit: 8,
          search: search || undefined,
          sortBy,
          sortOrder,
        });
        setDonations(result.data);
        setError("");
      } catch {
        setError("Failed to load donations.");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [page, search, sortBy, sortOrder]);

  const totalPages = donations?.totalPages || 1;

  const handleDownloadReceipt = async (donationId: number) => {
    try {
      setDownloadingId(donationId);
      setDownloadError(null);
      const receipt = await getDonationReceipt(donationId);
      generateReceiptPDF(receipt.data);
    } catch {
      setDownloadError("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0b2b53]">
          Donation History
        </h1>
        <p className="text-slate-500">
          All of your recent contributions and their status.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search by campaign"
          containerClassName="w-full sm:flex-1 md:flex-none md:w-64"
        />
        <FilterSelect
          value={sortBy}
          containerClassName="w-full sm:flex-1 md:w-auto"
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          options={[
            { value: "donatedAt", label: "Date" },
            { value: "amount", label: "Amount" },
            { value: "status", label: "Status" },
          ]}
        />
        <FilterSelect
          value={sortOrder}
          containerClassName="w-full sm:flex-1 md:w-auto"
          onChange={(event) =>
            setSortOrder(event.target.value as "asc" | "desc")
          }
          options={[
            { value: "desc", label: "Newest" },
            { value: "asc", label: "Oldest" },
          ]}
        />
      </div>

      {downloadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {downloadError}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading donations...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : donations?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No donations found.
        </div>
      ) : (
        <>
          <DonationTable
            items={donations?.items || []}
            onDownloadReceipt={handleDownloadReceipt}
            downloadingId={downloadingId}
          />
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
