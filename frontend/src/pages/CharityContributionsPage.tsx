import { useEffect, useMemo, useState } from "react";
import CharitySidebar from "../components/CharitySidebar";
import { getAuthToken } from "../services/auth.api";
import {
  getCharityCampaignContributions,
  getCharityCampaigns,
  getCharityContributions,
} from "../services/charityDashboard.api";
import { getApiErrorMessage } from "../services/apiErrors";
import { useAuthStore } from "../store/authStore";
import type {
  CharityCampaignDonationsResponse,
  CharityCampaignSummary,
  CharityContributionsResponse,
  CharityDonation,
} from "../types/charityDashboard";
import { resolveAssetUrl } from "../utils/media";

const sortOptions = [
  { label: "Newest", value: "donatedAt" },
  { label: "Amount", value: "amount" },
  { label: "Status", value: "status" },
] as const;

export default function CharityContributionsPage() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const [contributions, setContributions] =
    useState<CharityContributionsResponse | null>(null);
  const [campaignOptions, setCampaignOptions] = useState<
    CharityCampaignSummary[]
  >([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState<
    Record<
      number,
      {
        data?: CharityCampaignDonationsResponse;
        loading: boolean;
        error?: string | null;
        page: number;
      }
    >
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] =
    useState<(typeof sortOptions)[number]["value"]>("donatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    const loadCampaignOptions = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          return;
        }
        const response = await getCharityCampaigns(token, {
          page: 1,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        setCampaignOptions(response.data.items);
      } catch {
        setCampaignOptions([]);
      }
    };

    void loadCampaignOptions();
  }, []);

  useEffect(() => {
    const loadContributions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
          setError("Session expired. Please login again.");
          return;
        }
        const response = await getCharityContributions(token, {
          page,
          limit: 5,
          donationLimit: 4,
          search: search || undefined,
          campaignId: selectedCampaign ? Number(selectedCampaign) : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortOrder,
        });
        setContributions(response.data);
        setExpandedCampaigns({});
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadContributions();
  }, [page, search, selectedCampaign, dateFrom, dateTo, sortBy, sortOrder]);

  const totalPages = contributions?.totalPages || 1;

  const loadCampaignDonations = async (campaignId: number, nextPage = 1) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: {
        data: prev[campaignId]?.data,
        loading: true,
        error: null,
        page: nextPage,
      },
    }));

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }
      const response = await getCharityCampaignContributions(
        token,
        campaignId,
        {
          page: nextPage,
          limit: 8,
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortOrder,
        },
      );
      setExpandedCampaigns((prev) => ({
        ...prev,
        [campaignId]: {
          data: response.data,
          loading: false,
          error: null,
          page: nextPage,
        },
      }));
    } catch (err) {
      setExpandedCampaigns((prev) => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          loading: false,
          error: getApiErrorMessage(err),
          page: nextPage,
        },
      }));
    }
  };

  const toggleCampaign = (campaignId: number) => {
    const current = expandedCampaigns[campaignId];
    if (!current) {
      void loadCampaignDonations(campaignId, 1);
      return;
    }
    setExpandedCampaigns((prev) => {
      const next = { ...prev };
      delete next[campaignId];
      return next;
    });
  };

  const renderDonorName = (donation: CharityDonation) => {
    if (donation.isAnonymous) {
      return "Anonymous Donor";
    }
    return donation.donor?.name || "Unknown Donor";
  };

  const renderStatusBadge = (status: CharityDonation["status"]) => {
    if (status === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700";
    }
    if (status === "FAILED") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const campaignTotal = useMemo(
    () => campaignOptions.length,
    [campaignOptions],
  );

  if (!user) {
    return null;
  }

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
        user={user}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 px-[6vw] py-12 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
            Contributions by Campaign
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Monitor every donation and expand each campaign to review full donor
            activity.
          </p>
        </header>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_auto_auto]">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search donor, campaign, or transaction"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
          <select
            value={selectedCampaign}
            onChange={(event) => {
              setPage(1);
              setSelectedCampaign(event.target.value);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All campaigns ({campaignTotal})</option>
            {campaignOptions.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
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
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`contribution-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-4 w-48 rounded-full bg-slate-200" />
                <div className="mt-4 h-20 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : contributions?.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No contributions found with the selected filters.
          </div>
        ) : (
          <div className="space-y-6">
            {contributions?.items.map((group) => {
              const isExpanded = Boolean(expandedCampaigns[group.campaign.id]);
              const expandedData = expandedCampaigns[group.campaign.id];
              const donationList =
                isExpanded && expandedData?.data
                  ? expandedData.data.donations
                  : group.donations;

              return (
                <section
                  key={group.campaign.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleCampaign(group.campaign.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      {group.campaign.imageUrl ? (
                        <img
                          src={
                            resolveAssetUrl(group.campaign.imageUrl) ||
                            undefined
                          }
                          alt={group.campaign.title}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-600">
                          {group.campaign.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-[#0b2b53]">
                          {group.campaign.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {Number(group.totals.totalRaised).toLocaleString()}{" "}
                          ETB · {group.totals.donorCount} donors ·{" "}
                          {group.totals.donationsCount} donations
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-600">
                      {isExpanded ? "Collapse" : "Expand"}
                    </div>
                  </button>

                  <div className="mt-5 space-y-3">
                    {expandedData?.loading ? (
                      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        Loading donations...
                      </div>
                    ) : expandedData?.error ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {expandedData.error}
                      </div>
                    ) : donationList.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        No donations for this campaign yet.
                      </div>
                    ) : (
                      donationList.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#0b2b53]">
                              {renderDonorName(donation)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(donation.donatedAt).toLocaleString()}
                              {donation.transactionId
                                ? ` · ${donation.transactionId}`
                                : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">
                              {Number(donation.amount).toLocaleString()} ETB
                            </p>
                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${renderStatusBadge(
                                donation.status,
                              )}`}
                            >
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {isExpanded &&
                      expandedData?.data &&
                      expandedData.data.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              loadCampaignDonations(
                                group.campaign.id,
                                Math.max(expandedData.page - 1, 1),
                              )
                            }
                            disabled={expandedData.page === 1}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-slate-500">
                            Page {expandedData.page} of{" "}
                            {expandedData.data.totalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              loadCampaignDonations(
                                group.campaign.id,
                                Math.min(
                                  expandedData.page + 1,
                                  expandedData.data?.totalPages || 1,
                                ),
                              )
                            }
                            disabled={
                              expandedData.page ===
                              (expandedData.data?.totalPages || 1)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                  </div>
                </section>
              );
            })}

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
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
