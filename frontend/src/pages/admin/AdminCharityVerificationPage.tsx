import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { SearchInput } from "../../components/ui/SearchInput";
import {
  approveCharityProfileRequest,
  getPublicFileUrl,
  rejectCharityProfileRequest,
} from "../../services/charityProfile.api";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminCharities } from "../../services/adminDashboard.api";
import type { AdminCharitiesResponse } from "../../types/adminDashboard";

const statusTabs = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

export default function AdminCharityVerificationPage() {
  const [charities, setCharities] = useState<AdminCharitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusTabs)[number]>("PENDING");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadCharities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminCharities({
        page,
        limit: 8,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setCharities(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCharities();
  }, [page, search, status]);

  const totalPages = charities?.totalPages || 1;

  const handleApprove = async (profileId: number) => {
    try {
      setBusyId(profileId);
      setFeedback(null);
      setError(null);
      await approveCharityProfileRequest(profileId);
      setFeedback("Charity profile approved successfully.");
      await loadCharities();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (profileId: number) => {
    try {
      setBusyId(profileId);
      setFeedback(null);
      setError(null);
      await rejectCharityProfileRequest(profileId);
      setFeedback("Charity profile rejected successfully.");
      await loadCharities();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const tabCounts = useMemo(
    () => ({
      PENDING: charities?.statusCounts.PENDING || 0,
      APPROVED: charities?.statusCounts.APPROVED || 0,
      REJECTED: charities?.statusCounts.REJECTED || 0,
      ALL:
        (charities?.statusCounts.PENDING || 0) +
        (charities?.statusCounts.APPROVED || 0) +
        (charities?.statusCounts.REJECTED || 0),
    }),
    [charities],
  );

  return (
    <AdminShell
      title="Charity Verification"
      description="Review pending registrations, and monitor approved or rejected charity profiles."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              status === tab
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
            }`}
          >
            {tab} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {feedback}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search organization, owner name, or email"
          containerClassName="w-full md:w-96"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`verification-skeleton-${index}`}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : charities?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No charity profiles found.
        </div>
      ) : (
        <div className="space-y-4">
          {charities?.items.map((profile) => (
            <article
              key={profile.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0b2b53]">{profile.organizationName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.user.name} ({profile.user.email})
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted {new Date(profile.createdAt).toLocaleString()}
                    {profile.verifiedAt
                      ? ` · Reviewed ${new Date(profile.verifiedAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      profile.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : profile.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {profile.status}
                  </span>

                  {profile.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === profile.id}
                        onClick={() => {
                          void handleApprove(profile.id);
                        }}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {busyId === profile.id ? "Saving..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === profile.id}
                        onClick={() => {
                          void handleReject(profile.id);
                        }}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
                      >
                        {busyId === profile.id ? "Saving..." : "Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-700">{profile.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getPublicFileUrl(profile.documentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  View Document
                </a>
                {profile.phone && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {profile.phone}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                  >
                    Website
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </AdminShell>
  );
}
