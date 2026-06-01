import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CharitySidebar from "../components/CharitySidebar";
import { getCharityCampaigns } from "../services/charityDashboard.api";
import CampaignCard from "../components/CampaignCard";
import { getApiErrorMessage } from "../services/apiErrors";
import { useAuthStore } from "../store/authStore";
import type { CharityCampaignsResponse } from "../types/charityDashboard";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterSelect } from "../components/ui/FilterSelect";
import CategoryDropdown from "../components/ui/CategoryDropdown";
import {
  campaignLocationOptions,
  type CampaignLocation,
} from "../utils/campaignLocations";
// resolveAssetUrl not needed here because CampaignCard handles images

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
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState<"ALL" | CampaignLocation>("ALL");

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
          location: location === "ALL" ? undefined : location,
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
  }, [page, search, sortBy, sortOrder, status, location]);

  const totalPages = campaigns?.totalPages || 1;
  // statusCounts no longer used in UI (dropdown handles status selection)

  // summary removed - categories are handled by dropdown now

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
                Review, filter, and track only your created fundraising
                campaigns.
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

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search campaigns"
                containerClassName="max-w-md flex-1"
              />
              <div className="flex items-center gap-3">
                <FilterSelect
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value as any);
                  }}
                  defaultOption={{ value: "ALL", label: "All Status" }}
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Closed", value: "CLOSED" },
                    { label: "Draft", value: "DRAFT" },
                  ]}
                  containerClassName="w-44"
                />
                <CategoryDropdown
                  value={category}
                  onChange={(v) => {
                    setPage(1);
                    setCategory(v);
                    // charity page doesn't currently use category filter server-side
                  }}
                />
                <FilterSelect
                  value={location}
                  onChange={(e) => {
                    setPage(1);
                    setLocation(e.target.value as any);
                  }}
                  defaultOption={{ value: "ALL", label: "All Locations" }}
                  options={campaignLocationOptions}
                  containerClassName="w-48"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FilterSelect
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as typeof sortBy)
                }
                options={[
                  { value: "createdAt", label: "Newest" },
                  { value: "currentAmount", label: "Amount Raised" },
                  { value: "targetAmount", label: "Target Amount" },
                  { value: "donorCount", label: "Donors" },
                  { value: "endDate", label: "Ending Soon" },
                ]}
                containerClassName="w-full sm:w-auto"
              />
              <button
                type="button"
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
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
                  category: c.category || "OTHER",
                  location: c.location || "ETHIOPIA",
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
