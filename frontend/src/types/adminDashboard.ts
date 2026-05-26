export type AdminOverviewResponse = {
  stats: {
    totalRaised: number;
    totalDonations: number;
    activeCampaigns: number;
    totalDonors: number;
    totalUsers: number;
    monthlyDonations: number;
  };
  campaignStatusCounts: {
    ACTIVE: number;
    CLOSED: number;
    DRAFT: number;
  };
  charityVerificationCounts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  donationTrends: Array<{
    month: string;
    totalAmount: number;
    donationsCount: number;
  }>;
  topCampaigns: Array<{
    id: number;
    title: string;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    currentAmount: number;
    targetAmount: number;
    donorCount: number;
    charity: {
      id: number;
      organizationName: string;
    };
  }>;
  recentDonations: Array<{
    id: number;
    amount: number;
    isAnonymous: boolean;
    donatedAt: string;
    transactionId?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    donor: {
      id: number;
      name: string;
      email: string;
    };
    campaign: {
      id: number;
      title: string;
      charity: {
        id: number;
        organizationName: string;
      };
    };
  }>;
};

export type AdminUsersResponse = {
  items: Array<{
    id: number;
    name: string;
    email: string;
    role: "DONOR" | "CHARITY" | "ADMIN";
    isVerified: boolean;
    createdAt: string;
    charityProfile: {
      id: number;
      organizationName: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
    } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  roleCounts: {
    DONOR: number;
    CHARITY: number;
    ADMIN: number;
  };
};

export type AdminCharitiesResponse = {
  items: Array<{
    id: number;
    userId: number;
    organizationName: string;
    description: string;
    documentUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    logo?: string | null;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    createdAt: string;
    updatedAt: string;
    verifiedAt?: string | null;
    user: {
      id: number;
      name: string;
      email: string;
      isVerified: boolean;
      createdAt: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
};

export type AdminCampaignsResponse = {
  items: Array<{
    id: number;
    title: string;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    imageUrl?: string | null;
    currentAmount: number;
    targetAmount: number;
    donorCount: number;
    createdAt: string;
    endDate?: string | null;
    charity: {
      id: number;
      organizationName: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  }>;
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

export type AdminDonationsResponse = {
  items: Array<{
    id: number;
    amount: number;
    isAnonymous: boolean;
    donatedAt: string;
    transactionId?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    donor: {
      id: number;
      name: string;
      email: string;
    };
    campaign: {
      id: number;
      title: string;
      charity: {
        id: number;
        organizationName: string;
      };
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: {
    PENDING: number;
    COMPLETED: number;
    FAILED: number;
    REFUNDED: number;
  };
};

export type AdminReportsResponse = {
  platformStats: {
    totalUsers: number;
    totalCampaigns: number;
    totalDonations: number;
    totalRaised: number;
    totalCharityProfiles: number;
  };
  campaignSummaries: Array<{
    id: number;
    title: string;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    charity: {
      id: number;
      organizationName: string;
    };
    targetAmount: number;
    currentAmount: number;
    donorCount: number;
    periodRaised: number;
    periodDonationsCount: number;
    periodUniqueDonors: number;
  }>;
  donationTrends: Array<{
    month: string;
    totalAmount: number;
    donationsCount: number;
  }>;
  systemUsage: {
    newUsersLast30Days: number;
    activeDonorsLast30Days: number;
    completedDonationsLast30Days: number;
    activeCampaigns: number;
  };
};
