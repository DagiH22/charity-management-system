import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../types/auth";
import CharitySidebar from "../../components/CharitySidebar";
import { getAuthToken } from "../../services/auth.api";
import { getCharityDashboard } from "../../services/charityDashboard.api";
import { getApiErrorMessage } from "../../services/apiErrors";
import type {
  CharityDashboardResponse,
  CharityDonation,
} from "../../types/charityDashboard";
import { resolveAssetUrl } from "../../utils/media";

type CharityDashboardProps = {
  user: User;
};

export default function CharityDashboard({ user }: CharityDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncSidebar = () => {
      setSidebarOpen(mediaQuery.matches);
    };

    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebar);
    };
  }, []);

  const [dashboard, setDashboard] = useState<CharityDashboardResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
          setError("Session expired. Please login again.");
          return;
        }
        const response = await getCharityDashboard(token);
        setDashboard(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const stats =
    dashboard?.stats ||
    ({
      totalRaised: 0,
      activeCampaigns: 0,
      totalCampaigns: 0,
      totalContributors: 0,
      monthlyContributions: 0,
    } as CharityDashboardResponse["stats"]);

  const activeCampaigns = dashboard?.activeCampaigns || [];
  const recentContributions = dashboard?.recentContributions || [];

  const formattedMonthlyLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, []);

  const renderDonationName = (donation: CharityDonation) => {
    if (donation.isAnonymous) {
      return "Anonymous Donor";
    }

    return donation.donor?.name || "Unknown Donor";
  };

  return (
    <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row">
      {sidebarOpen && (
        <button
          className="absolute inset-0 z-20 bg-slate-950/20 lg:hidden"
          type="button"
          aria-label="Close charity sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CharitySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 px-[6vw] py-12 lg:px-8">
        <header className="mb-10 block items-center justify-between sm:flex">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
              type="button"
              aria-label={
                sidebarOpen ? "Close charity sidebar" : "Open charity sidebar"
              }
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-1.5 text-base text-slate-500">
                Here's an overview of your charity activity.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 sm:mt-0 sm:shrink-0">
            <Link
              to="/dashboard/create-campaign"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Campaign
            </Link>
          </div>
        </header>

        {!user.isVerified && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="rounded-full bg-amber-100 p-2">
              <svg
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                Verification pending
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Your charity profile is submitted. An admin will review your
                document soon. Limited features apply until verified.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`stat-skeleton-${index}`}
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
                  key={`section-skeleton-${index}`}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-4 w-40 rounded-full bg-slate-200" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 3 }).map((__, rowIndex) => (
                      <div
                        key={`row-${rowIndex}`}
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
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600">
                    Total Raised
                  </h3>
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {stats.totalRaised.toLocaleString()} ETB
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-slate-500">
                    From {stats.totalContributors} contributors
                  </span>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600">
                    Active Campaigns
                  </h3>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {stats.activeCampaigns}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-slate-500">Currently running</span>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-violet-600">
                    Total Campaigns
                  </h3>
                  <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {stats.totalCampaigns}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-slate-500">
                    Active + closed + draft
                  </span>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600">
                    Contributors
                  </h3>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">
                  {stats.totalContributors}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-slate-500">Unique donors</span>
                </div>
              </div>

              <div className="group sm:col-span-2 lg:col-span-4 xl:col-span-1 border border-emerald-200 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {formattedMonthlyLabel}
                  </h3>
                  <div className="rounded-lg bg-white p-2 text-emerald-600 shadow-sm">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-emerald-900">
                  {stats.monthlyContributions.toLocaleString()}{" "}
                  <span className="text-xl font-bold">ETB</span>
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <div className="inline-flex items-center rounded-full bg-emerald-100/80 px-2 py-0.5 text-xs font-medium text-emerald-800 shadow-sm">
                    Monthly Activity
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Active Campaigns
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your currently running fundraising efforts.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
                  to="/charity/campaigns"
                >
                  View All Campaigns
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              {activeCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-slate-900">
                    No active campaigns
                  </h3>
                  <p className="mb-6 font-medium text-slate-500">
                    Get started by creating your first fundraising campaign.
                  </p>
                  <Link
                    className="inline-flex items-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    to="/dashboard/create-campaign"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Campaign
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeCampaigns.map((campaign) => {
                    const progress = Math.min(
                      100,
                      (Number(campaign.currentAmount) /
                        Number(campaign.targetAmount || 1)) *
                        100,
                    );
                    const daysRemaining = campaign.endDate
                      ? Math.max(
                          0,
                          Math.ceil(
                            (new Date(campaign.endDate).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )
                      : null;

                    return (
                      <Link
                        key={campaign.id}
                        to={`/campaigns/${campaign.id}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                      >
                        {campaign.imageUrl && (
                          <div className="relative h-48 overflow-hidden bg-slate-100">
                            <img
                              src={
                                resolveAssetUrl(campaign.imageUrl) || undefined
                              }
                              alt={campaign.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-emerald-700">
                            {campaign.title}
                          </h3>

                          <div className="mt-auto">
                            <div className="mb-2 flex items-end justify-between text-sm">
                              <div>
                                <span className="font-bold text-slate-900">
                                  {Number(
                                    campaign.currentAmount,
                                  ).toLocaleString()}{" "}
                                  ETB
                                </span>
                                <span className="text-slate-500">
                                  {" "}
                                  raised of{" "}
                                  {Number(
                                    campaign.targetAmount,
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <span className="font-semibold text-emerald-600">
                                {progress.toFixed(0)}%
                              </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                              {daysRemaining !== null && (
                                <div className="flex items-center">
                                  <svg
                                    className="mr-1.5 h-4 w-4 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {daysRemaining} days left
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-[#0b2b53]">
                  Recent Contributions
                </h2>
                <Link
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                  to="/charity/contributions"
                >
                  View All
                </Link>
              </div>
              {recentContributions.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3">
                  <div className="rounded-full bg-slate-100 p-4">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 12H4M12 20V4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-500">
                    No donations yet. Share your campaign to start raising.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {recentContributions.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[#0b2b53]">
                          {donation.campaign?.title || "Campaign"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span>{renderDonationName(donation)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span>
                            {new Date(donation.donatedAt).toLocaleString()}
                          </span>
                          {donation.transactionId && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>{donation.transactionId}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-emerald-600">
                          {Number(donation.amount).toLocaleString()} ETB
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            donation.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
