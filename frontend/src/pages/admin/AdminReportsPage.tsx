import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import formatCurrency from "../../utils/format";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminReports } from "../../services/adminDashboard.api";
import type { AdminReportsResponse } from "../../types/adminDashboard";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminReports({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setReports(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const maxTrendAmount = useMemo(() => {
    if (!reports) {
      return 1;
    }

    return Math.max(
      ...reports.donationTrends.map((trend) => trend.totalAmount),
      1,
    );
  }, [reports]);

  return (
    <AdminShell
      title="Reports"
      description="Campaign summaries, platform statistics, donation trends, and system usage insights."
      actions={
        <button
          type="button"
          onClick={() => {
            void loadReports();
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            void loadReports();
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Apply Filter
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`reports-skeleton-${index}`}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : reports ? (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Users
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatCurrency(reports.platformStats.totalUsers)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Campaigns
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatCurrency(reports.platformStats.totalCampaigns)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Donations
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatCurrency(reports.platformStats.totalDonations)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Raised
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatCurrency(reports.platformStats.totalRaised)} ETB
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Active Campaigns
              </p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">
                {formatCurrency(reports.systemUsage.activeCampaigns)}
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Donation Trends (12 months)
              </h2>
              <div className="mt-5 space-y-3">
                {reports.donationTrends.map((trend) => {
                  const width = (trend.totalAmount / maxTrendAmount) * 100;

                  return (
                    <div key={trend.month}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{trend.month}</span>
                        <span>
                          {formatCurrency(trend.totalAmount)} ETB (
                          {formatCurrency(trend.donationsCount)})
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
              <h2 className="text-lg font-bold text-slate-900">
                System Usage (Last 30 Days)
              </h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">New users</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(reports.systemUsage.newUsersLast30Days)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Active donors</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(reports.systemUsage.activeDonorsLast30Days)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Completed donations</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(
                      reports.systemUsage.completedDonationsLast30Days,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Donation Summary Per Campaign
            </h2>
            {reports.campaignSummaries.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No campaign report data available.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Charity</th>
                      <th className="px-4 py-3">Raised (Period)</th>
                      <th className="px-4 py-3">Donations</th>
                      <th className="px-4 py-3">Unique Donors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.campaignSummaries.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0b2b53]">
                            {campaign.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {campaign.status}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {campaign.charity.organizationName}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          {formatCurrency(campaign.periodRaised)} ETB
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatCurrency(campaign.periodDonationsCount)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatCurrency(campaign.periodUniqueDonors)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
