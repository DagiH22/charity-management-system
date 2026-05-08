import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { getMyCampaigns } from "../services/campaign.api";
import type { Campaign } from "../types/campaign";
import { useAuthStore } from "../store/authStore";
import { getAuthToken } from "../services/auth.api";
import { Navigate } from "react-router-dom";

const MyCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        const token = getAuthToken();
        if(!token)
          return;
        const data = await getMyCampaigns(token);
        setCampaigns(data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch campaigns",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

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
            <h1 className="text-4xl font-bold text-gray-800">
              My Campaigns
            </h1>

            <p className="mt-2 text-gray-600">
              Manage and monitor your fundraising campaigns.
            </p>
          </div>

          <button className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">
            Create Campaign
          </button>
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