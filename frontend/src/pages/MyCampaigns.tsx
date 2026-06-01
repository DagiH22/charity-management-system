import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { getMyCampaigns } from "../services/campaign.api";
import CategoryFilterDropdown from "../components/ui/CategoryFilterDropdown";
import { FilterSelect } from "../components/ui/FilterSelect";
import type { Campaign } from "../types/campaign";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";
import {
  campaignLocationOptions,
  type CampaignLocation,
} from "../utils/campaignLocations";

const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [location, setLocation] = useState<"ALL" | CampaignLocation>("ALL");
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  if (user.role !== "CHARITY") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const params: { category?: string; location?: string } = {};
        if (category && category !== "ALL") params.category = category;
        if (location && location !== "ALL") params.location = location;

        const data = await getMyCampaigns(params);
        setCampaigns(data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [category, location]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading campaigns...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Campaigns</h1>

            <p className="mt-2 text-gray-600">
              Manage and monitor your fundraising campaigns.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <CategoryFilterDropdown
              value={category}
              onChange={(v) => setCategory(v)}
              status={status}
              onStatusChange={(s) => setStatus(s)}
            />

            <FilterSelect
              value={location}
              onChange={(event) => setLocation(event.target.value as any)}
              defaultOption={{ value: "ALL", label: "All Locations" }}
              options={campaignLocationOptions}
              containerClassName="w-52"
            />

            <button className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">
              Create Campaign
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-700">
              No campaigns yet
            </h2>

            <p className="mt-2 text-gray-500">
              Start your first fundraising campaign.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;
