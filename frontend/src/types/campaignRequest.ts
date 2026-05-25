export type CampaignRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CampaignRequestItem = {
  id: number;
  charityId: number;
  reason: string;
  status: CampaignRequestStatus;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedById?: number | null;
  consumedAt?: string | null;
  consumedCampaignId?: number | null;
  monthCampaignCount: number;
  totalCampaignCount: number;
  activeCampaignCount: number;
  charity: {
    id: number;
    organizationName: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type CampaignRequestSummary = {
  charity: {
    id: number;
    userId: number;
    organizationName: string;
  };
  currentMonthCampaignCount: number;
  totalCampaignCount: number;
  activeCampaignCount: number;
  pendingRequestCount: number;
  approvedAllowanceCount: number;
  monthlyLimit: number;
  hasExceededLimit: boolean;
  hasApprovedAllowance: boolean;
};

export type CharityCampaignRequestsResponse = {
  summary: CampaignRequestSummary;
  items: CampaignRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<CampaignRequestStatus, number>;
};

export type AdminCampaignRequestsResponse = {
  items: CampaignRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<CampaignRequestStatus, number>;
};
