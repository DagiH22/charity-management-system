import { useEffect, useState } from "react";
import { getAllCampaigns } from "../services/campaign.api";
import { getAuthToken } from "../services/auth.api";
import type { Campaign } from "../types/campaign";
import CampaignCard from "../components/CampaignCard";
import { useNavigate } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getAllCampaigns();
        setCampaigns(data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load campaigns"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [navigate]);

  const handleCampaignClosed = (campaignId: number) => {
    setCampaigns(campaigns.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: "Closed" as const }
        : campaign
    ));
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">Explore Campaigns</h1>
          <p className="mt-2 text-emerald-100">
            Browse and support meaningful campaigns from charities
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center">
            <p className="text-gray-600">No campaigns available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex flex-col">
                <CampaignCard 
                  campaign={campaign}
                  onCampaignClosed={handleCampaignClosed}
                  isOwner={user?.role === "CHARITY" && campaign.charityId === user?.charityId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
