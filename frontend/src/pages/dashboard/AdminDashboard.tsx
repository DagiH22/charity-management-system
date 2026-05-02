import { useEffect, useState } from "react";
import { getAuthToken } from "../../services/auth.api";
import {
  approveCharityProfileRequest,
  getPendingCharityProfilesRequest,
  getPublicFileUrl,
} from "../../services/charityProfile.api";
import { getApiErrorMessage } from "../../services/apiErrors";
import type { PendingCharityRegistration } from "../../types/auth";

export default function AdminDashboard() {
  const [pendingProfiles, setPendingProfiles] = useState<PendingCharityRegistration[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approvingProfileId, setApprovingProfileId] = useState<number | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const handleApprove = async (profileId: number) => {
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