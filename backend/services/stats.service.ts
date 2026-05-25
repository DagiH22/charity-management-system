import { prisma } from "../utils/prisma";

export type PlatformStats = {
  totalDonations: number;
  activeCampaigns: number;
  peopleHelped: number;
  totalDonors: number;
};

export const getPlatformStatsService = async (): Promise<PlatformStats> => {
  const [donationAgg, activeCampaigns, totalDonors, peopleHelped] =
    await Promise.all([
      // Sum of all completed donation amounts
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),

      // Count of active campaigns
      prisma.campaign.count({
        where: { status: "ACTIVE" },
      }),

      // Count of distinct donors who made completed donations
      prisma.donation.groupBy({
        by: ["donorId"],
        where: { status: "COMPLETED" },
      }),

      // Sum of donorCount across all campaigns (people who benefited)
      prisma.campaign.aggregate({
        _sum: { donorCount: true },
      }),
    ]);

  return {
    totalDonations: Number(donationAgg._sum.amount ?? 0),
    activeCampaigns,
    peopleHelped: peopleHelped._sum.donorCount ?? 0,
    totalDonors: totalDonors.length,
  };
};
