import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDonorFollowingCampaigns } from "../services/donor.api";
import { getAuthToken } from "../services/auth.api";
import { resolveAssetUrl } from "../utils/media";

type FollowedCampaign = {
  id: number;
  campaignId: number;
  campaign: {
    id: number;
    title: string;
    description: string;
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
  const navigate = useNavigate();
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
        const token = getAuthToken();
        if (!token) {
          setError("Authentication required to view followed campaigns.");
          setLoading(false);
          return;
        }
        const result = await getDonorFollowingCampaigns(token, {
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
    <div className="mx-auto max-w-[1100px] py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0b2b53]">
          Followed Campaigns
        </h1>
        <p className="text-slate-500">
          Campaigns you are currently following for updates.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search by campaign"
          className="w-full md:w-64 rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as "" | "ACTIVE" | "CLOSED" | "DRAFT");
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
          <option value="DRAFT">Draft</option>
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
            {following?.items.map((follow) => {
              const camp = follow.campaign;
              const progress = Math.min(
                Math.round(
                  (Number(camp.currentAmount) / Number(camp.targetAmount)) *
                    100,
                ),
                100,
              );
              const daysRemaining = camp.endDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(camp.endDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : null;

              return (
                <div
                  key={follow.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        resolveAssetUrl(camp.imageUrl) ||
                        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80"
                      }
                      alt={camp.title}
                      className="h-20 w-24 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-lg font-bold text-[#0b2b53]">
                        {camp.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {camp.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                        <span>{camp.donorCount} donors</span>
                        {daysRemaining !== null && (
                          <span>{daysRemaining} days left</span>
                        )}
                        <span className="uppercase">{camp.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/campaigns/${camp.id}`)}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    View Campaign
                  </button>
                </div>
              );
            })}
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
