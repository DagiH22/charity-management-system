import type { Campaign } from "../types/campaign";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { closeCampaign } from "../services/campaign.api";
import { getAuthToken } from "../services/auth.api";

interface CampaignCardProps {
  campaign: Campaign;
  onCampaignClosed?: (id: number) => void;
  isOwner?: boolean;
}

const CampaignCard = ({ campaign, onCampaignClosed, isOwner = false }: CampaignCardProps) => {
  const progressPercentage = Math.min(
    (campaign.currentAmount / campaign.targetAmount) * 100,
    100,
  );
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState(campaign.status);

  async function handleCloseCampaign(id: number): Promise<void> {
    if (!window.confirm("Are you sure you want to close this campaign? This action cannot be undone.")) {
      return;
    }

    try {
      setClosing(true);
      const token = getAuthToken();
      if (!token) {
        alert("You must be logged in to close a campaign");
        return;
      }

      await closeCampaign(token, id.toString());
      setStatus("Closed");
      onCampaignClosed?.(id);
      alert("Campaign closed successfully!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to close campaign"
      );
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {campaign.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {new Date(campaign.startDate).toLocaleDateString()} -{" "}
            {new Date(campaign.endDate).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Description */}
      <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-gray-600">
        {campaign.description}
      </p>

      {/* Donation Progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span className="text-gray-600">
            Raised: ${campaign.currentAmount.toLocaleString()}
          </span>

          <span className="text-emerald-600">
            Goal: ${campaign.targetAmount.toLocaleString()}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="mt-2 text-right text-xs font-medium text-gray-500">
          {progressPercentage.toFixed(0)}% completed
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <button className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
          View Details
        </button>
        {isOwner ? (
          status !== "Closed" ? (
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
              onClick={() =>
                navigate(`/dashboard/edit-campaign/${campaign.id}`)
              }
            >
              Edit
            </button>
            <button
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => handleCloseCampaign(campaign.id)}
              disabled={closing}
            >
              {closing ? "Closing..." : "Close"}
            </button>
          </div>
          ) : (
          <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600">
            Closed
          </span>
        )
        ) : (
          <div className="text-sm text-gray-500">
            By {campaign.charity?.organizationName || "Unknown"}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;