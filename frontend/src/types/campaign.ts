export type Campaign = {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: "Pending" | "Active" | "Closed";
  startDate: string;
  endDate: string;
  charityId: number;
  charity?: {
    id: number;
    organizationName: string;
    address?: string;
  };
};

export type EditCampaignFormValues = {
  title: string;
  description: string;
  targetAmount: string;
  endDate: string;
};