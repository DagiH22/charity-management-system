export type CharityDashboardStats = {
  totalRaised: number;
  activeCampaigns: number;
  totalCampaigns: number;
  totalContributors: number;
  monthlyContributions: number;
};

export type CharityCampaignSummary = {
  id: number;
  title: string;
  imageUrl?: string | null;
  currentAmount: number;
  targetAmount: number;
  donorCount: number;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  endDate?: string | null;
};

export type CharityDonation = {
  id: number;
  amount: number;
  isAnonymous: boolean;
  donatedAt: string;
  transactionId?: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  donor?: {
    id: number;
    name: string;
    profileImage?: string | null;
  } | null;
  campaign?: {
    id: number;
    title: string;
  } | null;
};

export type CharityDashboardResponse = {
  stats: CharityDashboardStats;
  activeCampaigns: CharityCampaignSummary[];
  recentContributions: CharityDonation[];
};

export type CharityCampaignsResponse = {
  items: CharityCampaignSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: {
    ACTIVE: number;
    CLOSED: number;
    DRAFT: number;
  };
};

export type CharityCampaignContributionGroup = {
  campaign: CharityCampaignSummary;
  totals: {
    totalRaised: number;
    donorCount: number;
    donationsCount: number;
  };
  donations: CharityDonation[];
};

export type CharityContributionsResponse = {
  items: CharityCampaignContributionGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CharityCampaignDonationsResponse = {
  campaign: CharityCampaignSummary;
  donations: CharityDonation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totals: {
    totalRaised: number;
    donorCount: number;
    donationsCount: number;
  };
};
