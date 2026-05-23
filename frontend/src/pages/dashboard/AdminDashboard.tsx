import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminOverview } from "../../services/adminDashboard.api";
import type { AdminOverviewResponse } from "../../types/adminDashboard";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminOverview();
        setOverview(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const monthlyLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, []);

  return (
    <AdminShell
      title="Admin Dashboard"
      description="Track platform health, donations, campaigns, and verification activity in one place."
      actions={
        <Link
          to="/admin/reports"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
        >
          Open Reports
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`admin-stat-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-28 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-20 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`admin-section-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-4 w-40 rounded-full bg-slate-200" />
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div
                      key={`admin-row-${rowIndex}`}
                      className="h-10 rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : overview ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Donations
              </p>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {overview.stats.totalDonations.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">Completed donations</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Campaigns
              </p>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {overview.stats.activeCampaigns.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">Across the platform</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Donors
              </p>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {overview.stats.totalDonors.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">Unique contributors</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Raised
              </p>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {overview.stats.totalRaised.toLocaleString()} ETB
              </p>
              <p className="mt-2 text-sm text-slate-500">Completed donations only</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {monthlyLabel}
              </p>
              <p className="mt-4 text-3xl font-extrabold text-emerald-900">
                {overview.stats.monthlyDonations.toLocaleString()} ETB
              </p>
              <p className="mt-2 text-sm text-emerald-700">Monthly donation volume</p>
            </div>
          </div>

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Donation Trend (6 months)</h2>
                <Link className="text-sm font-semibold text-emerald-600" to="/admin/reports">
                  Detailed Reports
                </Link>
              </div>
              <div className="space-y-3">
                {overview.donationTrends.map((item) => {
                  const maxAmount = Math.max(
                    ...overview.donationTrends.map((row) => row.totalAmount),
                    1,
                  );
                  const width = (item.totalAmount / maxAmount) * 100;

                  return (
                    <div key={item.month}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.month}</span>
                        <span>
                          {item.totalAmount.toLocaleString()} ETB ({item.donationsCount})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Verification Queue</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-amber-700">Pending</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-900">
                    {overview.charityVerificationCounts.PENDING}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Approved</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-900">
                    {overview.charityVerificationCounts.APPROVED}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-rose-700">Rejected</p>
                  <p className="mt-1 text-2xl font-extrabold text-rose-900">
                    {overview.charityVerificationCounts.REJECTED}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Donations</h2>
              <Link className="text-sm font-semibold text-emerald-600" to="/admin/donations">
                View Donation Logs
              </Link>
            </div>
            {overview.recentDonations.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No donations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div>
                      <p className="font-semibold text-[#0b2b53]">
                        {donation.campaign.title} · {donation.campaign.charity.organizationName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {donation.isAnonymous ? "Anonymous donor" : donation.donor.name} · {" "}
                        {new Date(donation.donatedAt).toLocaleString()}
                        {donation.transactionId ? ` · ${donation.transactionId}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {Number(donation.amount).toLocaleString()} ETB
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Top Campaigns</h2>
              <Link className="text-sm font-semibold text-emerald-600" to="/admin/campaigns">
                Campaign Oversight
              </Link>
            </div>
            <div className="space-y-3">
              {overview.topCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div>
                    <p className="font-semibold text-[#0b2b53]">{campaign.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {campaign.charity.organizationName} · {campaign.donorCount} donors
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-slate-900">
                      {Number(campaign.currentAmount).toLocaleString()} / {" "}
                      {Number(campaign.targetAmount).toLocaleString()} ETB
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
