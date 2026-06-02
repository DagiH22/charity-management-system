import { useEffect, useState } from "react";
import { getAllCampaigns } from "../services/campaign.api";
import type { Campaign } from "../types/campaign";
import CampaignCard from "../components/CampaignCard";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DonorSidebar from "../components/DonorSidebar";
import CharitySidebar from "../components/CharitySidebar";
import { getApiErrorMessage } from "../services/apiErrors";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterSelect } from "../components/ui/FilterSelect";
import type { CampaignCategory } from "../utils/campaignCategories";
import CategoryDropdown from "../components/ui/CategoryDropdown";
import {
  campaignLocationOptions,
  type CampaignLocation,
} from "../utils/campaignLocations";

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
] as const;

export default function CampaignsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  // Use backend status values (uppercase) to match returned data: 'ACTIVE' | 'CLOSED'
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");
  const [category, setCategory] = useState<"ALL" | CampaignCategory>("ALL");
  const [location, setLocation] = useState<"ALL" | CampaignLocation>("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "currentAmount" | "targetAmount" | "donorCount" | "endDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = () => setSidebarOpen(mediaQuery.matches);
    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError("");
        // Usually, would map filter states natively into an API request
        // Using existing `getAllCampaigns` and filtering linearly if not paginated on this endpoint for guest access temporarily
        const data = await getAllCampaigns({
          category: category === "ALL" ? undefined : category,
          location: location === "ALL" ? undefined : location,
        });
        let fetchedData = data.data || [];

        // Quick local filter mapped dynamically
        if (status !== "ALL") {
          // Normalize campaign.status to uppercase string to avoid mismatches
          fetchedData = fetchedData.filter(
            (c: Campaign) => String(c.status).toUpperCase() === status,
          );
        }

        if (category !== "ALL") {
          fetchedData = fetchedData.filter(
            (c: Campaign) => c.category === category,
          );
        }

        if (location !== "ALL") {
          fetchedData = fetchedData.filter(
            (c: Campaign) => c.location === location,
          );
        }

        const searchTerm = search.trim().toLowerCase();
        if (searchTerm) {
          fetchedData = fetchedData.filter(
            (c: Campaign) =>
              c.title.toLowerCase().includes(searchTerm) ||
              (c.description || "").toLowerCase().includes(searchTerm) ||
              (c.charity?.organizationName &&
                c.charity.organizationName.toLowerCase().includes(searchTerm)),
          );
        }

        fetchedData = fetchedData.sort((a: any, b: any) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];
          if (sortBy === "createdAt" || sortBy === "endDate") {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        setCampaigns(fetchedData);
      } catch (err: any) {
        setError(getApiErrorMessage(err) || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [navigate, status, search, sortBy, sortOrder, category, location]);

  const handleCampaignClosed = (campaignId: number) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, status: "Closed" as const }
          : campaign,
      ),
    );
  };

  const isDonorOrGuest = !user || user?.role === "DONOR";
  const isCharity = user?.role === "CHARITY";
  const hasSidebarLayout = isDonorOrGuest || isCharity;

  const renderContent = () => (
    <div className="flex-1 min-w-0">
      <header className="mb-10 block items-center justify-between sm:flex">
        <div className="flex items-start gap-4">
          {hasSidebarLayout && (
            <button
              className="mt-1 inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
              type="button"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
              Explore Campaigns
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Browse and support meaningful campaigns from verified charities.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row flex-1 gap-4">
            <SearchInput
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              containerClassName="w-full sm:max-w-md"
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                defaultOption={{ value: "ALL", label: "All Status" }}
                options={statusOptions}
                containerClassName="w-full sm:w-32"
              />
              <div className="w-full sm:w-auto">
                <CategoryDropdown
                  value={category}
                  onChange={(v) => setCategory(v as any)}
                />
              </div>
              <FilterSelect
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                defaultOption={{ value: "ALL", label: "All Locations" }}
                options={campaignLocationOptions}
                containerClassName="w-full sm:w-40"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 lg:mt-0">
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { value: "createdAt", label: "Date Created" },
                { value: "endDate", label: "End Date" },
                { value: "currentAmount", label: "Amount Raised" },
                { value: "targetAmount", label: "Target Amount" },
                { value: "donorCount", label: "Donors" },
              ]}
              containerClassName="w-full sm:w-auto"
            />
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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

      {/* category/status controls are in the main filter bar above; removed duplicate controls */}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 skeleton-shimmer h-96"
            ></div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
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
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="font-semibold text-slate-900">No campaigns found.</p>
          <p className="mt-1 text-slate-500 text-sm max-w-xs mx-auto">
            Try adjusting your search criteria and filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onCampaignClosed={handleCampaignClosed}
              isOwner={
                user?.role === "CHARITY" &&
                campaign.charityId === user?.charityId
              }
            />
          ))}
        </div>
      )}
    </div>
  );

  if (!isDonorOrGuest) {
    if (isCharity) {
      return (
        <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row">
          <CharitySidebar
            isOpen={sidebarOpen}
            user={user}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="min-w-0 flex-1 px-[6vw] py-8 lg:px-8 lg:py-12 flex flex-col bg-slate-50/10">
            {renderContent()}
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[1200px] py-12 px-[6vw]">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row">
      <DonorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-w-0 flex-1 px-[6vw] py-8 lg:px-8 lg:py-12 flex flex-col bg-slate-50/10">
        {renderContent()}
      </div>
    </div>
  );
}
