import type { User } from "../../types/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDonorDashboard } from "../../services/donor.api";
import { resolveAssetUrl } from "../../utils/media";
import DonorSidebar from "../../components/DonorSidebar";
import {
  CreditCard,
  Heart,
  Map,
  UserCircle,
  Activity,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

type DonorDashboardProps = {
  user: User;
};

export default function DonorDashboard({ user }: DonorDashboardProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = () => setSidebarOpen(mediaQuery.matches);
    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDonorDashboard();
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
    <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row">
      <DonorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-w-0 flex-1 px-[6vw] py-8 lg:px-8 lg:py-12 space-y-10 lg:space-y-12">
        {/* ──────────────────────────────────────────────────────────── */}
        {/* HEADER SECTION */}
        {/* ──────────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <button
              className="mt-2 inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
              type="button"
              aria-label={
                sidebarOpen ? "Close donor sidebar" : "Open donor sidebar"
              }
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
            </button>
            {user.profileImage ? (
              <img
                src={resolveAssetUrl(user.profileImage) ?? undefined}
                alt="Profile"
                className="h-24 w-24 rounded-2xl object-cover shadow-sm bg-slate-100 border border-slate-200"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2b53] to-[#0b2b53]/80 text-3xl font-bold text-white shadow-sm border border-[#0b2b53]/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-lg text-slate-500 max-w-2xl">
                You've contributed to{" "}
                <span className="font-semibold text-slate-700">
                  {stats.campaignsSupported} campaigns
                </span>{" "}
                and helped make a difference.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Link
              to="/campaigns"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2b53] px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#0b2b53]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2b53]"
            >
              Explore Campaigns
            </Link>
          </div>
        </header>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STATISTICS CARDS */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Donated */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <TrendingUp size={24} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Total Donated
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.totalDonated.toLocaleString()}
                </p>
                <span className="text-sm font-semibold text-slate-500">
                  ETB
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Across{" "}
                <span className="text-slate-700 font-semibold">
                  {stats.campaignsSupported}
                </span>{" "}
                campaigns
              </p>
            </div>
          </div>

          {/* Monthly Donation */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CreditCard size={24} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Monthly Donation
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.monthlyTotal.toLocaleString()}
                </p>
                <span className="text-sm font-semibold text-slate-500">
                  ETB
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500">
                This month
              </p>
            </div>
          </div>

          {/* Followed Campaigns */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-rose-50 opacity-50 transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Heart size={24} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Followed Campaigns
              </h3>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats.activeFollowed}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Active campaigns tracked
              </p>
            </div>
          </div>

          {/* Anonymous Profile */}
          <Link
            to="/dashboard/anonymous-donations"
            className="group relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300"
          >
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-indigo-100 opacity-50 transition-transform group-hover:scale-150" />
            <div className="relative flex h-full flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <UserCircle size={24} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
                Anonymous Profile
              </h3>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {stats.anonymousCount}
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between text-indigo-600">
                <span className="text-sm font-semibold">
                  Anonymous Donations
                </span>
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MAIN CONTENT GRID */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
          {/* RECENT DONATIONS */}
          <section className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Donations
                </h2>
              </div>
              <Link
                to="/dashboard/donations"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {recentDonations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      No donations yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500 max-w-[250px]">
                      Your donation history will appear here once you make a
                      contribution.
                    </p>
                  </div>
                  <Link
                    to="/campaigns"
                    className="mt-2 rounded-xl bg-emerald-100 px-6 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    Find a Campaign
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentDonations.map((donation: any) => (
                    <li
                      key={donation.id}
                      onClick={() => navigate(`/dashboard/donations`)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-4 transition-all hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${
                            donation.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-[280px]">
                            {donation.campaign.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-sm font-medium text-slate-500">
                              {new Date(donation.donatedAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span
                              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                donation.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {donation.status}
                            </span>
                            {donation.isAnonymous && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                  <UserCircle size={10} /> Anon
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="sm:text-right pl-14 sm:pl-0 flex items-center justify-between sm:block">
                        <p className="font-extrabold text-slate-900 text-lg">
                          {Number(donation.amount).toLocaleString()}{" "}
                          <span className="text-sm text-slate-500">ETB</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* FOLLOWING CAMPAIGNS */}
          <section className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Followed Campaigns
                </h2>
              </div>
              <Link
                to="/dashboard/following-campaigns"
                className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              {followingPreview.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Map size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Not following any campaigns
                    </p>
                    <p className="mt-1 text-sm text-slate-500 max-w-[250px]">
                      Stay updated on campaigns you care about by hearting them.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {followingPreview.map((follow: any) => {
                    const camp = follow.campaign;
                    const progress = Math.min(
                      Math.round(
                        (Number(camp.currentAmount) /
                          Number(camp.targetAmount)) *
                          100,
                      ),
                      100,
                    );

                    return (
                      <li
                        key={follow.id}
                        onClick={() => navigate(`/campaigns/${camp.id}`)}
                        className="group flex flex-col sm:flex-row gap-4 rounded-xl p-3 sm:p-4 transition-all hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="relative flex-shrink-0 h-40 sm:h-20 w-full sm:w-28 rounded-lg overflow-hidden">
                          <img
                            src={
                              resolveAssetUrl(camp.imageUrl) ||
                              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80"
                            }
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 sm:hidden">
                            {camp.status === "ACTIVE" ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-sky-700 backdrop-blur-sm shadow-sm">
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-slate-600 backdrop-blur-sm shadow-sm">
                                Closed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {camp.title}
                            </p>
                            <div className="hidden sm:block flex-shrink-0">
                              {camp.status === "ACTIVE" ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  Closed
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-3">
                            <div className="flex justify-between text-xs font-semibold mb-1.5">
                              <span className="text-slate-700">
                                {Number(camp.currentAmount).toLocaleString()}{" "}
                                ETB raised
                              </span>
                              <span className="text-emerald-600">
                                {progress}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
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
    </div>
  );
}
