import type { Campaign } from "../types/campaign";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { closeCampaign } from "../services/campaign.api";
import { resolveAssetUrl } from "../utils/media";
import formatCurrency from "../utils/format";
import CategoryBadge from "./CategoryBadge";
import { getCampaignLocationLabel } from "../utils/campaignLocations";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

interface CampaignCardProps {
  campaign: Campaign;
  onCampaignClosed?: (id: number) => void;
  isOwner?: boolean;
}

const CampaignCard = ({
  campaign,
  onCampaignClosed,
  isOwner = false,
}: CampaignCardProps) => {
  const progressPercentage = Math.min(
    (campaign.currentAmount / campaign.targetAmount) * 100,
    100,
  );
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState(campaign.status);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  async function handleCloseCampaign(id: number): Promise<void> {
    if (
      !window.confirm(
        "Are you sure you want to close this campaign? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setClosing(true);
      setFeedback(null);
      await closeCampaign(id.toString());
      setStatus("Closed");
      onCampaignClosed?.(id);
      setFeedback({
        type: "success",
        message: "Campaign closed successfully!",
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to close campaign",
      });
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative mb-5 overflow-hidden rounded-xl">
        {/* campaign image fallback to Avatar initials if image fails */}
        {campaign.imageUrl ? (
          <img
            src={resolveAssetUrl(campaign.imageUrl) || undefined}
            alt={campaign.title}
            className="h-48 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // hide broken image and rely on initials avatar below
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-emerald-50 text-4xl font-bold text-emerald-600">
            {campaign.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute top-3 left-3 shadow-sm">
          <CategoryBadge
            category={campaign.category}
            className="shadow-sm border border-black/5 backdrop-blur-sm shadow-black/5"
          />
        </div>
        <div className="absolute top-3 right-3 shadow-sm">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm bg-white/90 ${
              (status as string).toUpperCase() === "ACTIVE"
                ? "text-emerald-700"
                : (status as string).toUpperCase() === "PENDING"
                  ? "text-amber-700"
                  : "text-rose-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-3 flex-1">
        <h2 className="text-xl font-extrabold text-[#0b2b53] line-clamp-2 leading-tight">
          {campaign.title}
        </h2>

        {/* Description */}
        <p className="mt-3 mb-4 line-clamp-3 text-sm leading-relaxed text-slate-500">
          {campaign.description}
        </p>

        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {new Date(campaign.startDate).toLocaleDateString()} -{" "}
            {new Date(campaign.endDate).toLocaleDateString()}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">
            {getCampaignLocationLabel(campaign.location)}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Donation Progress */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span className="text-gray-600">
            Raised: ETB {formatCurrency(Number(campaign.currentAmount))}
          </span>

          <span className="text-emerald-600">
            Goal: ETB {formatCurrency(Number(campaign.targetAmount))}
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
        <button
          className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
        >
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
