import { useNavigate } from "react-router-dom";
import { resolveAssetUrl } from "../utils/media";
import CategoryBadge from "./CategoryBadge";
import { getCampaignLocationLabel } from "../utils/campaignLocations";

type CompactCampaignCardProps = {
  campaign: {
    id: number;
    title: string;
    description: string;
    category?: string;
    location?: string;
    currentAmount: number | string;
    targetAmount: number | string;
    donorCount?: number; // make optional since some endpoints might not return it
    status: string;
    endDate?: string | null;
    imageUrl?: string | null;
  };
};

export const CompactCampaignCard = ({ campaign }: CompactCampaignCardProps) => {
  const navigate = useNavigate();

  const progress = Math.min(
    Math.round(
      (Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100,
    ),
    100,
  );

  const daysRemaining = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-full">
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={
              resolveAssetUrl(campaign.imageUrl) ||
              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80"
            }
            alt={campaign.title}
            className="h-24 w-24 rounded-xl object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <CategoryBadge
              category={campaign.category}
              className="!text-[10px]"
            />
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#0b2b53]">
            {campaign.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {campaign.description}
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
            {campaign.donorCount !== undefined && (
              <span>{campaign.donorCount} donors</span>
            )}
            <span>{getCampaignLocationLabel(campaign.location)}</span>
            {daysRemaining !== null && <span>{daysRemaining} days left</span>}
            <span className="uppercase">{campaign.status}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-1">
        <button
          onClick={() => navigate(`/campaigns/${campaign.id}`)}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          View Campaign
        </button>
      </div>
    </div>
  );
};
