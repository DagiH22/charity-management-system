import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../../components/AdminShell";
import formatCurrency from "../../utils/format";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminCampaigns } from "../../services/adminDashboard.api";
import type { AdminCampaignsResponse } from "../../types/adminDashboard";
import { resolveAssetUrl } from "../../utils/media";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterSelect } from "../../components/ui/FilterSelect";
import CategoryDropdown from "../../components/ui/CategoryDropdown";
import CategoryBadge from "../../components/CategoryBadge";
import {
  campaignLocationOptions,
  type CampaignLocation,
} from "../../utils/campaignLocations";

const statusTabs = ["ACTIVE", "CLOSED", "ALL"] as const;

export default function AdminCampaignOversightPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<AdminCampaignsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusTabs)[number]>("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "currentAmount" | "targetAmount" | "donorCount"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState<"ALL" | CampaignLocation>("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminCampaigns({
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

    void load();
  }, [page, search, status, sortBy, sortOrder, location]);

  const totalPages = campaigns?.totalPages || 1;

  return (
    <AdminShell
      title="Campaign Oversight"
      description="Review all campaigns across organizations, including active and closed."
    >
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <SearchInput
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search campaign or charity"
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
                ]}
                containerClassName="w-44"
              />
              <CategoryDropdown
                value={category}
                onChange={(v) => {
                  setPage(1);
                  setCategory(v);
                  // admin list not filtered by category server-side for now
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
                { value: "currentAmount", label: "Raised Amount" },
                { value: "targetAmount", label: "Target Amount" },
                { value: "donorCount", label: "Donor Count" },
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
              key={`admin-campaign-skeleton-${index}`}
              className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : campaigns?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No campaigns found.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns?.items.map((campaign) => {
            const progress = Math.min(
              100,
              (Number(campaign.currentAmount) /
                Number(campaign.targetAmount || 1)) *
                100,
            );

            return (
              <button
                key={campaign.id}
                type="button"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
              >
                {campaign.imageUrl ? (
                  <img
                    src={resolveAssetUrl(campaign.imageUrl) || undefined}
                    alt={campaign.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-500">
                    {campaign.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-lg font-bold text-[#0b2b53]">
                      {campaign.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        campaign.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : campaign.status === "CLOSED"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <CategoryBadge category={campaign.category} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {campaign.charity.organizationName}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatCurrency(Number(campaign.currentAmount))} /{" "}
                    {formatCurrency(Number(campaign.targetAmount))} ETB
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{campaign.donorCount} donors</span>
                    <span>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
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
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </AdminShell>
  );
}
