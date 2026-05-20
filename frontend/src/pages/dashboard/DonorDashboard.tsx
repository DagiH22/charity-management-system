import type { User } from "../../types/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDonorDashboard } from "../../services/donor.api";

import { getAuthToken } from "../../services/auth.api";
import { resolveAssetUrl } from "../../utils/media";

type DonorDashboardProps = {
  user: User;
};

export default function DonorDashboard({ user }: DonorDashboardProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const result = await getDonorDashboard(token);
        setData(result.data);
      } catch {
        // Swallow fetch errors; empty states handle display.
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading your profile...
      </div>
    );
  }

  const { stats, recentDonations, followingPreview } = data || {
    stats: {
      totalDonated: 0,
      campaignsSupported: 0,
      monthlyTotal: 0,
      activeFollowed: 0,
      anonymousCount: 0,
    },
    recentDonations: [],
    followingPreview: [],
  };

  return (
    <div className="mx-auto max-w-[1200px] py-8 space-y-10">
      <header className="flex items-center gap-6">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover shadow-sm bg-slate-100"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0b2b53] text-2xl font-bold text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            You've contributed to {stats.campaignsSupported} campaigns and
            helped make a difference.
          </p>
        </div>
      </header>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 border-b border-t border-slate-100 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Total Donated
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {stats.totalDonated.toLocaleString()} ETB
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Across {stats.campaignsSupported} campaigns
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Monthly Donation
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {stats.monthlyTotal.toLocaleString()} ETB
          </p>
          <p className="mt-2 text-sm text-slate-500">This month</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Followed Campaigns
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {stats.activeFollowed}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Active campaigns tracked
          </p>
        </div>
        <Link
          to="/dashboard/anonymous-donations"
          className="block rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Anonymous Profile
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {stats.anonymousCount}
          </p>
          <p className="mt-2 text-sm text-emerald-700 font-medium">
            Anonymous Donations
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* RECENT DONATIONS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-[#0b2b53]">
              Recent Donations
            </h2>
            <Link
              to="/dashboard/donations"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-500"
            >
              View Full
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {recentDonations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                <p className="font-medium text-slate-500">No donations yet</p>
                <Link
                  to="/campaigns"
                  className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-600"
                >
                  Find a Campaign
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentDonations.map((donation: any) => (
                  <li
                    key={donation.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100 cursor-pointer"
                    onClick={() => navigate(`/dashboard/donations`)}
                  >
                    <div>
                      <p className="font-bold text-[#0b2b53] truncate max-w-[200px] sm:max-w-xs">
                        {donation.campaign.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(donation.donatedAt).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${donation.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {donation.status}
                        </span>
                        {donation.isAnonymous && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            Anonymous
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-600">
                        {Number(donation.amount).toLocaleString()} ETB
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* FOLLOWING CAMPAIGNS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold text-[#0b2b53]">
              Followed Campaigns
            </h2>
            <Link
              to="/dashboard/following-campaigns"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-500"
            >
              View Full
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {followingPreview.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                <p className="font-medium text-slate-500">
                  Not following any campaigns
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {followingPreview.map((follow: any) => {
                  const camp = follow.campaign;
                  const progress = Math.min(
                    Math.round(
                      (Number(camp.currentAmount) / Number(camp.targetAmount)) *
                        100,
                    ),
                    100,
                  );

                  return (
                    <li
                      key={follow.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:bg-slate-100 cursor-pointer"
                      onClick={() => navigate(`/campaigns/${camp.id}`)}
                    >
                      <img
                        src={
                          resolveAssetUrl(camp.imageUrl) ||
                          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80"
                        }
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0b2b53] truncate">
                          {camp.title}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      <div>
                        {camp.status === "ACTIVE" ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-sky-100 text-sky-700">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-slate-200 text-slate-600">
                            Closed
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
