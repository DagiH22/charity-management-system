import { useState, useEffect } from "react";
import { getDonorFollowingCampaigns } from "../services/donor.api";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterSelect } from "../components/ui/FilterSelect";
import { CompactCampaignCard } from "../components/CompactCampaignCard";

type FollowedCampaign = {
  id: number;
  campaignId: number;
  campaign: {
    id: number;
    title: string;
    description: string;
    category?: string;
    currentAmount: number;
    targetAmount: number;
    donorCount: number;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    endDate?: string | null;
    imageUrl?: string | null;
  };
};

type FollowingResponse = {
  items: FollowedCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function DonorFollowingPage() {
  const [following, setFollowing] = useState<FollowingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "CLOSED" | "DRAFT">("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const result = await getDonorFollowingCampaigns({
          page,
          limit: 6,
          search: search || undefined,
          status: status || undefined,
          sortOrder,
        });
        setFollowing(result.data);
        setError("");
      } catch {
        setError("Failed to load followed campaigns.");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [page, search, status, sortOrder]);

  const totalPages = following?.totalPages || 1;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0b2b53]">
          Followed Campaigns
        </h1>
        <p className="text-slate-500">
          Campaigns you are currently following for updates.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search by campaign"
          containerClassName="w-full md:w-64"
        />
        <FilterSelect
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as "" | "ACTIVE" | "CLOSED" | "DRAFT");
          }}
          options={[
            { value: "", label: "All status" },
            { value: "ACTIVE", label: "Active" },
            { value: "CLOSED", label: "Closed" },
            { value: "DRAFT", label: "Draft" },
          ]}
        />
        <FilterSelect
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as "asc" | "desc")
          }
          options={[
            { value: "desc", label: "Newest" },
            { value: "asc", label: "Oldest" },
          ]}
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading followed campaigns...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : following?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          You are not following any campaigns yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {following?.items.map((follow) => (
              <CompactCampaignCard key={follow.id} campaign={follow.campaign} />
            ))}
          </div>
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
