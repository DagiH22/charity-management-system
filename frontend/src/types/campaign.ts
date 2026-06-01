import type { CampaignCategory } from "../utils/campaignCategories";
import type { CampaignLocation } from "../utils/campaignLocations";

export type Campaign = {
  id: number;
  title: string;
  description: string;
  category: CampaignCategory;
  location?: CampaignLocation;
  targetAmount: number;
  currentAmount: number;
  status: "Pending" | "Active" | "Closed";
  startDate: string;
  endDate: string;
  charityId: number;
  imageUrl?: string | null;
  charity?: {
    id: number;
    organizationName: string;
    address?: string;
    logo?: string;
    description?: string;
    verifiedAt?: string;
    socialFacebook?: string | null;
    socialTwitter?: string | null;
    socialInstagram?: string | null;
    socialTelegram?: string | null;
    socialYoutube?: string | null;
    socialTiktok?: string | null;
  };
};

export type EditCampaignFormValues = {
  title: string;
  description: string;
  category: CampaignCategory | "";
  location: CampaignLocation | "";
  targetAmount: string;
  endDate: string;
};
