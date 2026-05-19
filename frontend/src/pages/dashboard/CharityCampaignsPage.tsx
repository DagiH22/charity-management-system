import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../../services/auth.api";
import { getCharityCampaigns } from "../../services/charityDashboard.api";
import { resolveAssetUrl } from "../../utils/media";

type Campaign = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  goalAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate: string;
  status: string;
};

export default function CharityCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCampaigns = async (page: number) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        setCampaigns([]);
        setTotalPages(1);
        return;
      }

      const response = await getCharityCampaigns(token, { page, limit: 12 });
      if (response && response.data) {
        setCampaigns(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setCampaigns([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCampaigns(currentPage);
  }, [currentPage]);

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your past and active fundraising campaigns
          </p>
        </div>
        <Link
          to="/dashboard/create-campaign"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Campaign
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={`skeleton-page-${index}`}
              className="animate-pulse rounded-lg bg-slate-200 p-4"
            >
              <div className="h-40 rounded-lg bg-slate-300" />
              <div className="mt-4 h-6 rounded-lg bg-slate-300" />
              <div className="mt-2 h-4 rounded-lg bg-slate-300" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={resolveAssetUrl(campaign.image) || undefined}
                alt={campaign.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {campaign.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {campaign.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase text-emerald-600">
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {campaign.raisedAmount} / {campaign.goalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}