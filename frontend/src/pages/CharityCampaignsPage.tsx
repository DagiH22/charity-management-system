import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CharitySidebar from "../components/CharitySidebar";
import { getCharityCampaigns } from "../services/charityDashboard.api";
import CampaignCard from "../components/CampaignCard";
import { getApiErrorMessage } from "../services/apiErrors";
import { useAuthStore } from "../store/authStore";
import type { CharityCampaignsResponse } from "../types/charityDashboard";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterSelect } from "../components/ui/FilterSelect";
// resolveAssetUrl not needed here because CampaignCard handles images

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
  { label: "Draft", value: "DRAFT" },
] as const;

export default function CharityCampaignsPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const [campaigns, setCampaigns] = useState<CharityCampaignsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "CLOSED" | "DRAFT" | "ALL">(
    "ACTIVE",
  );
  const [sortBy, setSortBy] = useState<
    "createdAt" | "currentAmount" | "targetAmount" | "donorCount" | "endDate"
  >("createdAt");
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
    const filter = searchParams.get("filter");
    if (!filter) {
      return;
    }
    if (filter.toLowerCase() === "active") {
      setStatus("ACTIVE");
    }
    if (filter.toLowerCase() === "closed") {
      setStatus("CLOSED");
    }
    if (filter.toLowerCase() === "draft") {
      setStatus("DRAFT");
    }
  }, [searchParams]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getCharityCampaigns({
          page,
          limit: 9,
          search: search || undefined,
          status: status === "ALL" ? undefined : status,
          sortBy,
          sortOrder,
        });
        setCampaigns(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCampaigns();
  }, [page, search, sortBy, sortOrder, status]);

  const totalPages = campaigns?.totalPages || 1;
  const statusCounts = campaigns?.statusCounts || {
    ACTIVE: 0,
    CLOSED: 0,
    DRAFT: 0,
  };

  const summary = useMemo(
    () =>
      statusOptions.map((item) => ({
        ...item,
        count: statusCounts[item.value],
      })),
    [statusCounts],
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
                My Campaigns
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Review, filter, and track only your created fundraising campaigns.
              </p>
            </div>
            <Link
              to="/dashboard/create-campaign"
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Create Campaign
            </Link>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          {summary.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setPage(1);
                setStatus(tab.value);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                status === tab.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setStatus("ALL");
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              status === "ALL"
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            All ({summary.reduce((acc, item) => acc + item.count, 0)})
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search campaigns"
            containerClassName="w-full md:w-64"
          />
          <FilterSelect
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            options={[
              { value: "createdAt", label: "Newest" },
              { value: "currentAmount", label: "Amount Raised" },
              { value: "targetAmount", label: "Target Amount" },
              { value: "donorCount", label: "Donors" },
              { value: "endDate", label: "Ending Soon" },
            ]}
          />
          <FilterSelect
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as "asc" | "desc")
            }
            options={[
              { value: "desc", label: "Descending" },
              { value: "asc", label: "Ascending" },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`campaign-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-32 rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-2/3 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-slate-200" />
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
        ) : campaigns?.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No campaigns found with the selected filters.
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {campaigns?.items.map((c) => {
                // Convert CharityCampaignSummary -> Campaign expected by CampaignCard
                const campaignForCard = {
                  id: c.id,
                  title: c.title,
                  description: c.title || "",
                  targetAmount: c.targetAmount,
                  currentAmount: c.currentAmount,
                  status:
                    c.status === "ACTIVE"
                      ? "Active"
                      : c.status === "CLOSED"
                        ? "Closed"
                        : "Pending",
                  startDate: new Date().toISOString(),
                  endDate: c.endDate || new Date().toISOString(),
                  charityId: 0,
                  imageUrl: c.imageUrl,
                  charity: undefined,
                } as unknown as import("../types/campaign").Campaign;

                return (
                  <CampaignCard
                    key={c.id}
                    campaign={campaignForCard}
                    isOwner={true}
                    onCampaignClosed={(id) => {
                      setCampaigns((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          items: prev.items.map((item) =>
                            item.id === id
                              ? { ...item, status: "CLOSED" }
                              : item,
                          ),
                        };
                      });
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-6">
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
          </>
        )}
      </div>
    </div>
  );
}
