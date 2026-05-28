import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import formatCurrency from "../../utils/format";
import DashboardErrorState from "../../components/dashboard/DashboardErrorState";
import DashboardLoadingState from "../../components/dashboard/DashboardLoadingState";
import DashboardSectionCard from "../../components/dashboard/DashboardSectionCard";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminOverview } from "../../services/adminDashboard.api";
import type { AdminOverviewResponse } from "../../types/adminDashboard";
import CategoryBadge from "../../components/CategoryBadge";

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

  const trendMaxAmount = useMemo(() => {
    if (!overview) {
      return 1;
    }

    return Math.max(
      ...overview.donationTrends.map((row) => row.totalAmount),
      1,
    );
  }, [overview]);

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
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : overview ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <DashboardStatCard
              title="Total Donations"
              value={formatCurrency(overview.stats.totalDonations)}
              subtitle="Completed donations"
            />
            <DashboardStatCard
              title="Active Campaigns"
              value={formatCurrency(overview.stats.activeCampaigns)}
              subtitle="Across the platform"
            />
            <DashboardStatCard
              title="Total Donors"
              value={formatCurrency(overview.stats.totalDonors)}
              subtitle="Unique contributors"
            />
            <DashboardStatCard
              title="Total Raised"
              value={`${formatCurrency(Number(overview.stats.totalRaised))} ETB`}
              subtitle="Completed donations only"
            />
            <DashboardStatCard
              title={monthlyLabel}
              value={`${formatCurrency(Number(overview.stats.monthlyDonations))} ETB`}
              subtitle="Monthly donation volume"
              className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50"
              titleClassName="text-emerald-800"
              valueClassName="text-emerald-900"
              subtitleClassName="text-emerald-700"
            />
          </div>

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <DashboardSectionCard
              className="xl:col-span-2"
              title="Donation Trend (6 months)"
              action={
                <Link
                  className="text-sm font-semibold text-emerald-600"
                  to="/admin/reports"
                >
                  Detailed Reports
                </Link>
              }
            >
              <div className="space-y-3">
                {overview.donationTrends.map((item) => {
                  const width = (item.totalAmount / trendMaxAmount) * 100;

                  return (
                    <div key={item.month}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.month}</span>
                        <span>
                          {formatCurrency(item.totalAmount)} ETB (
                          {formatCurrency(item.donationsCount)})
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
            </DashboardSectionCard>

            <DashboardSectionCard title="Verification Queue">
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-amber-700">
                    Pending
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-900">
                    {overview.charityVerificationCounts.PENDING}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-emerald-700">
                    Approved
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-900">
                    {overview.charityVerificationCounts.APPROVED}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-rose-700">
                    Rejected
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-rose-900">
                    {overview.charityVerificationCounts.REJECTED}
                  </p>
                </div>
              </div>
            </DashboardSectionCard>
          </section>

          <DashboardSectionCard
            className="mt-8"
            title="Recent Donations"
            action={
              <Link
                className="text-sm font-semibold text-emerald-600"
                to="/admin/donations"
              >
                View Donation Logs
              </Link>
            }
          >
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
                        {donation.campaign.title} ·{" "}
                        {donation.campaign.charity?.organizationName ||
                          "Unknown charity"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {donation.isAnonymous
                          ? "Anonymous donor"
                          : donation.donor?.name ||
                            donation.guestName ||
                            "Guest donor"}{" "}
                        · {new Date(donation.donatedAt).toLocaleString()}
                        {donation.transactionId
                          ? ` · ${donation.transactionId}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {formatCurrency(Number(donation.amount))} ETB
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
            className="mt-8"
            title="Top Campaigns"
            action={
              <Link
                className="text-sm font-semibold text-emerald-600"
                to="/admin/campaigns"
              >
                Campaign Oversight
              </Link>
            }
          >
            <div className="space-y-3">
              {overview.topCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div>
                    <p className="font-semibold text-[#0b2b53]">
                      {campaign.title}
                    </p>
                    <div className="mt-1">
                      <CategoryBadge category={campaign.category} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {campaign.charity?.organizationName || "Unknown charity"}{" "}
                      · {campaign.donorCount} donors
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(Number(campaign.currentAmount))} /{" "}
                      {formatCurrency(Number(campaign.targetAmount))} ETB
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardSectionCard>
        </>
      ) : null}
    </AdminShell>
  );
}
