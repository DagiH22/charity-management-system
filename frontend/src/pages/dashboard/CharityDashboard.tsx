import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const renderStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return "bg-emerald-100 text-emerald-700";
    }
    if (status === "CLOSED") {
      return "bg-slate-200 text-slate-700";
    }
    return "bg-amber-100 text-amber-700";
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
        <header className="mb-10">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
              type="button"
              aria-label={
                sidebarOpen ? "Close charity sidebar" : "Open charity sidebar"
              }
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Here's an overview of your charity activity.
              </p>
            </div>
          </div>
        </header>

        {!user.isVerified && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">
              Verification pending
            </p>
            <p className="mt-1 text-sm text-amber-700/90">
              Your charity profile is submitted. An admin will review your
              document soon.
            </p>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Total Raised
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
                  {stats.totalRaised.toLocaleString()} ETB
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  From {stats.totalContributors} contributors
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Active Campaigns
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
                  {stats.activeCampaigns}
                </p>
                <p className="mt-2 text-sm text-slate-500">Currently running</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Total Campaigns
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
                  {stats.totalCampaigns}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Active + closed + draft
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Contributors
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
                  {stats.totalContributors}
                </p>
                <p className="mt-2 text-sm text-slate-500">Unique donors</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  {formattedMonthlyLabel}
                </h3>
                <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
                  {stats.monthlyContributions.toLocaleString()} ETB
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Monthly contributions
                </p>
              </div>
            </div>

            <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-[#0b2b53]">
                  Active Campaigns
                </h2>
                <Link
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                  to="/charity/campaigns?filter=active"
                >
                  View All
                </Link>
              </div>
              {activeCampaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <p className="font-medium text-slate-500">
                    No active campaigns yet.
                  </p>
                  <Link
                    className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-600 focus:outline-none"
                    to="/dashboard/create-campaign"
                  >
                    Create a Campaign
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
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
                      <button
                        key={campaign.id}
                        type="button"
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-left transition hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          {campaign.imageUrl ? (
                            <img
                              src={
                                resolveAssetUrl(campaign.imageUrl) || undefined
                              }
                              alt={campaign.title}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                              {campaign.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-[#0b2b53]">
                              {campaign.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <span>{campaign.donorCount} donors</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>
                                {Number(
                                  campaign.currentAmount,
                                ).toLocaleString()}{" "}
                                /{" "}
                                {Number(campaign.targetAmount).toLocaleString()}{" "}
                                ETB
                              </span>
                            </div>
                          </div>
                          <span
                            className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold uppercase ${renderStatusBadge(
                              campaign.status,
                            )}`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>{Math.round(progress)}% funded</span>
                            <span>
                              {daysRemaining !== null
                                ? `${daysRemaining} days left`
                                : "Ongoing"}
                            </span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </button>
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
