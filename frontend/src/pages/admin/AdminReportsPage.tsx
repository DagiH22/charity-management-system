import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import formatCurrency from "../../utils/format";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminReports } from "../../services/adminDashboard.api";
import type { AdminReportsResponse } from "../../types/adminDashboard";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts/es6";
import {
  Download,
  Users,
  FolderHeart,
  HeartHandshake,
  TrendingUp,
  Activity,
  Trophy,
} from "lucide-react";

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

  const exportToCSV = () => {
    if (!reports) return;
    const headers = [
      "Campaign",
      "Status",
      "Charity",
      "Raised (ETB)",
      "Donations",
      "Unique Donors",
    ];
    const rows = reports.campaignSummaries.map((c) => [
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      `"${c.charity.organizationName.replace(/"/g, '""')}"`,
      c.periodRaised,
      c.periodDonationsCount,
      c.periodUniqueDonors,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `campaign_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "#10b981", // emerald-500
    CLOSED: "#ef4444", // red-500
    DRAFT: "#f59e0b", // amber-500
    COMPLETED: "#3b82f6", // blue-500
  };

  // Processed Data
  const topCampaigns = useMemo(() => {
    if (!reports) return [];
    return [...reports.campaignSummaries]
      .sort((a, b) => b.periodRaised - a.periodRaised)
      .slice(0, 5);
  }, [reports]);

  const statusDistribution = useMemo(() => {
    if (!reports) return [];
    const counts = reports.campaignSummaries.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Insights
  const highestPerforming = useMemo(() => {
    if (!reports || reports.campaignSummaries.length === 0) return null;
    return [...reports.campaignSummaries].sort(
      (a, b) => b.periodRaised - a.periodRaised,
    )[0];
  }, [reports]);

  const avgDonation = useMemo(() => {
    if (!reports || reports.platformStats.totalDonations === 0) return 0;
    return (
      reports.platformStats.totalRaised / reports.platformStats.totalDonations
    );
  }, [reports]);

  const mostActivePeriod = useMemo(() => {
    if (!reports || reports.donationTrends.length === 0) return null;
    return [...reports.donationTrends].sort(
      (a, b) => b.totalAmount - a.totalAmount,
    )[0];
  }, [reports]);

  return (
    <AdminShell
      title="Reports"
      description="Campaign summaries, platform statistics, donation trends, and system usage insights."
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={!reports || reports.campaignSummaries.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              void loadReports();
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>
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
          {/* Smart Insights Banner */}
          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-indigo-100/50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600/80">
                  Top Campaign
                </p>
                <p
                  className="truncate text-sm font-bold text-slate-900"
                  title={highestPerforming?.title}
                >
                  {highestPerforming?.title || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/80">
                  Avg Donation
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(avgDonation)} ETB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600/80">
                  Peak Month
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {mostActivePeriod?.month || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-sky-100/50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600/80">
                  Total Donations
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(reports.platformStats.totalDonations)}
                </p>
              </div>
            </div>
          </section>

          {/* Top Stat Cards */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Users
                </p>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(reports.platformStats.totalUsers)}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +
                {reports.systemUsage.newUsersLast30Days} this month
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Campaigns
                </p>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <FolderHeart className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(reports.platformStats.totalCampaigns)}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {reports.systemUsage.activeCampaigns} currently active
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Raised
                </p>
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <span className="font-bold text-sm">ETB</span>
                </div>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(reports.platformStats.totalRaised)}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Platform lifetime
              </p>
            </div>

            <div className="col-span-1 xl:col-span-2 group rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Active Donors
                </p>
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-900">
                {formatCurrency(reports.systemUsage.activeDonorsLast30Days)}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {reports.systemUsage.completedDonationsLast30Days} completed
                donations last 30 days
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Donation Trends Chart */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-slate-900">
                Donation Trends (12 Months)
              </h2>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={reports.donationTrends}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `${formatCurrency(value)}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any, name: any) => [
                        name === "totalAmount"
                          ? `${formatCurrency(value as number)} ETB`
                          : value,
                        name === "totalAmount" ? "Raised" : "Donations",
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalAmount"
                      name="totalAmount"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      animationDuration={1500}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="donationsCount"
                      name="donationsCount"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Status Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-slate-900">
                Campaign Status
              </h2>
              <div className="h-[320px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.name] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any) => [
                        `${value} Campaigns`,
                        "Count",
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">
              Top Campaigns Activity
            </h2>
            <div className="h-[360px] w-full">
              {topCampaigns.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <p>No campaign performance data available.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCampaigns}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `${formatCurrency(value)}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      axisLine={false}
                      tickLine={false}
                      width={160}
                      tick={{ fill: "#334155", fontSize: 13, fontWeight: 500 }}
                      tickFormatter={(value: string) =>
                        value.length > 20
                          ? `${value.substring(0, 20)}...`
                          : value
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any) => [
                        `${formatCurrency(value as number)} ETB`,
                        "Raised",
                      ]}
                    />
                    <Bar
                      dataKey="periodRaised"
                      name="Raised (ETB)"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                      animationDuration={1500}
                    >
                      {topCampaigns.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#10b981" : "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
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
