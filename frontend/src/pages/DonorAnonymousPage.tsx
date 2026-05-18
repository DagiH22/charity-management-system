import { useEffect, useState } from "react";
import { getAuthToken } from "../services/auth.api";
import { getDonorAnonymousDonations } from "../services/donor.api";
import { DonationTable } from "../components/DonationTable";
import type { DonationItem } from "../components/DonationTable";

type DonationsResponse = {
  items: DonationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function DonorAnonymousPage() {
  const [donations, setDonations] = useState<DonationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"donatedAt" | "amount" | "status">(
    "donatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          setError("Authentication required to view anonymous donations.");
          setLoading(false);
          return;
        }
        const result = await getDonorAnonymousDonations(token, {
          page,
          limit: 8,
          search: search || undefined,
          sortBy,
          sortOrder,
        });
        setDonations(result.data);
        setError("");
      } catch {
        setError("Failed to load anonymous donations.");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [page, search, sortBy, sortOrder]);

  const totalPages = donations?.totalPages || 1;

  return (
    <div className="mx-auto max-w-[1100px] py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0b2b53]">
          Anonymous Donations
        </h1>
        <p className="text-slate-500">Your donations marked as anonymous.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search by campaign"
          className="w-full md:w-64 rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="donatedAt">Date</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
        </select>
        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as "asc" | "desc")
          }
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading anonymous donations...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : donations?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No anonymous donations found.
        </div>
      ) : (
        <>
          <DonationTable items={donations?.items || []} forceAnonymousBadge />
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
