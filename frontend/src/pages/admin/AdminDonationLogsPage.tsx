import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminCampaigns, getAdminDonations } from "../../services/adminDashboard.api";
import type { AdminCampaignsResponse, AdminDonationsResponse } from "../../types/adminDashboard";

const statusTabs = ["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"] as const;

export default function AdminDonationLogsPage() {
  const [donations, setDonations] = useState<AdminDonationsResponse | null>(null);
  const [campaigns, setCampaigns] = useState<AdminCampaignsResponse["items"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusTabs)[number]>("ALL");
  const [campaignId, setCampaignId] = useState("");
  const [anonymous, setAnonymous] = useState<"ALL" | "YES" | "NO">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"donatedAt" | "amount" | "status">("donatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await getAdminCampaigns({ page: 1, limit: 100, sortBy: "createdAt" });
        setCampaigns(response.data.items);
      } catch {
        setCampaigns([]);
      }
    };

    void loadCampaigns();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminDonations({
          page,
          limit: 15,
          search: search || undefined,
          status: status === "ALL" ? undefined : status,
          campaignId: campaignId ? Number(campaignId) : undefined,
          anonymous:
            anonymous === "ALL" ? undefined : anonymous === "YES" ? true : false,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortOrder,
        });
        setDonations(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [anonymous, campaignId, dateFrom, dateTo, page, search, sortBy, sortOrder, status]);

  const totalPages = donations?.totalPages || 1;
  const donationItems = donations?.items || [];

  const statusCounts = useMemo(
    () => ({
      ALL:
        (donations?.statusCounts.COMPLETED || 0) +
        (donations?.statusCounts.PENDING || 0) +
        (donations?.statusCounts.FAILED || 0) +
        (donations?.statusCounts.REFUNDED || 0),
      COMPLETED: donations?.statusCounts.COMPLETED || 0,
      PENDING: donations?.statusCounts.PENDING || 0,
      FAILED: donations?.statusCounts.FAILED || 0,
      REFUNDED: donations?.statusCounts.REFUNDED || 0,
    }),
    [donations],
  );

  return (
    <AdminShell
      title="Donation Logs"
      description="Inspect all platform donations and filter by campaign, date range, status, or anonymity."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              status === tab
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            {tab} ({statusCounts[tab]})
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.6fr_0.6fr_0.6fr_0.6fr_auto]">
        <input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search donor, email, campaign, transaction"
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
        <select
          value={campaignId}
          onChange={(event) => {
            setPage(1);
            setCampaignId(event.target.value);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All campaigns ({campaigns.length})</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
        <select
          value={anonymous}
          onChange={(event) => {
            setPage(1);
            setAnonymous(event.target.value as typeof anonymous);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="ALL">All donors</option>
          <option value="YES">Anonymous</option>
          <option value="NO">Named</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setPage(1);
            setDateFrom(event.target.value);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => {
            setPage(1);
            setDateTo(event.target.value);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="donatedAt">Newest</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
        </select>
        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`admin-donation-skeleton-${index}`}
              className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
      ) : donationItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No donations found with the selected filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Donation</th>
                <th className="px-5 py-3">Donor</th>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {donationItems.map((donation) => (
                <tr key={donation.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-emerald-700">
                      {Number(donation.amount).toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-slate-500">
                      {donation.transactionId || "No transaction id"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0b2b53]">
                      {donation.isAnonymous ? "Anonymous Donor" : donation.donor.name}
                    </p>
                    {!donation.isAnonymous && (
                      <p className="text-xs text-slate-500">{donation.donor.email}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{donation.campaign.title}</p>
                    <p className="text-xs text-slate-500">
                      {donation.campaign.charity.organizationName}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        donation.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : donation.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : donation.status === "REFUNDED"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(donation.donatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
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
    </AdminShell>
  );
}
