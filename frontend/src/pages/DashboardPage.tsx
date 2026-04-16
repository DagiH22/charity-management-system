import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  approveCharityProfileRequest,
  getApiErrorMessage,
  getAuthToken,
  getPendingCharityProfilesRequest,
  getPublicFileUrl,
} from "../services/auth.api";
import type { PendingCharityRegistration, User } from "../types/auth";

type DashboardPageProps = {
  user: User | null;
};

export default function DashboardPage({ user }: DashboardPageProps) {
  const [pendingProfiles, setPendingProfiles] = useState<PendingCharityRegistration[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approvingProfileId, setApprovingProfileId] = useState<number | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setPendingError("Session expired. Please login again.");
      return;
    }

    const loadPendingProfiles = async () => {
      try {
        setIsLoadingPending(true);
        setPendingError(null);
        const response = await getPendingCharityProfilesRequest(token);
        setPendingProfiles(response.profiles);
      } catch (error) {
        setPendingError(getApiErrorMessage(error));
      } finally {
        setIsLoadingPending(false);
      }
    };

    void loadPendingProfiles();
  }, [isAdmin]);

  const handleApprove = async (profileId: number) => {
    if (!isAdmin) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setPendingError("Session expired. Please login again.");
      return;
    }

    try {
      setApprovingProfileId(profileId);
      setApprovalMessage(null);
      setPendingError(null);

      await approveCharityProfileRequest(token, profileId);

      setPendingProfiles((prev) => prev.filter((profile) => profile.id !== profileId));
      setApprovalMessage("Charity profile approved successfully.");
    } catch (error) {
      setPendingError(getApiErrorMessage(error));
    } finally {
      setApprovingProfileId(null);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "CHARITY" && !user.hasCharityProfile) {
    return <Navigate to="/charity-profile/setup" replace />;
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-[1200px] py-8">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
              Admin Verification Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Review pending charity registrations and approve verified organizations.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Reviews</p>
            <p className="mt-1 text-2xl font-extrabold text-[#0b2b53]">{pendingProfiles.length}</p>
          </div>
        </header>

        {approvalMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {approvalMessage}
          </div>
        )}

        {pendingError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {pendingError}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(10,40,80,0.04)]">
          <h2 className="text-lg font-bold text-[#0b2b53]">Pending Charity Registrations</h2>

          {isLoadingPending ? (
            <p className="mt-4 text-sm text-slate-500">Loading pending profiles...</p>
          ) : pendingProfiles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No pending charity registrations right now.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {pendingProfiles.map((profile) => (
                <article key={profile.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{profile.organizationName}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Submitted by <span className="font-semibold">{profile.user.name}</span> ({profile.user.email})
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Submitted on {new Date(profile.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={approvingProfileId === profile.id}
                      onClick={() => {
                        void handleApprove(profile.id);
                      }}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {approvingProfileId === profile.id ? "Approving..." : "Approve"}
                    </button>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">{profile.description}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={getPublicFileUrl(profile.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      View Document
                    </a>
                    {profile.phone && (
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                        Phone: {profile.phone}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const isDonor = user.role === "DONOR";
  const isCharity = user.role === "CHARITY";

  return (
    <div className="mx-auto max-w-[1200px] py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-slate-500 text-lg">
          Here's an overview of your activity.
        </p>
      </header>

      {isCharity && !user.isVerified && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-700">Verification pending</p>
          <p className="mt-1 text-sm text-amber-700/90">
            Your charity profile is submitted. An admin will review your document soon.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Common Stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Account Status
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {user.isVerified ? "Verified" : "Pending"}
          </p>
          <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {user.role}
          </span>
        </div>

        {/* Donor Specific Data */}
        {isDonor && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Total Donated
              </h3>
              <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">$0.00</p>
              <p className="mt-2 text-sm text-slate-500">Across 0 campaigns</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Impact Score
              </h3>
              <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">New</p>
              <p className="mt-2 text-sm text-slate-500">Start donating to grow!</p>
            </div>
          </>
        )}

        {/* Charity Specific Data */}
        {isCharity && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Active Campaigns
              </h3>
              <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">0</p>
              <p className="mt-2 text-sm text-slate-500">Ready to start one?</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Total Raised
              </h3>
              <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">$0.00</p>
              <p className="mt-2 text-sm text-slate-500">From 0 donors</p>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <h2 className="text-xl font-bold text-[#0b2b53]">
            {isDonor ? "Recent Donations" : "Recent Contributions"}
          </h2>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
            View All
          </button>
        </div>
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-slate-100 p-4">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4M12 20V4"
              />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Nothing to show yet</p>
          <button className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-600 focus:outline-none">
            {isDonor ? "Find a Campaign" : "Create a Campaign"}
          </button>
        </div>
      </section>
    </div>
  );
}
