import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import CharitySidebar from "../components/CharitySidebar";
import { getApiErrorMessage } from "../services/apiErrors";
import {
  createCampaignRequest,
  getMyCampaignRequests,
} from "../services/campaignRequest.api";
import type {
  CampaignRequestItem,
  CampaignRequestSummary,
  CharityCampaignRequestsResponse,
} from "../types/campaignRequest";
import { useAuthStore } from "../store/authStore";

const PAGE_SIZE = 6;

const formatTime = (value: string) =>
  new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CharityCampaignRequestsPage() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [data, setData] = useState<CharityCampaignRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncSidebar = () => {
      setSidebarOpen(mediaQuery.matches);
    };

    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebar);
    };
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyCampaignRequests({ page, limit: PAGE_SIZE });
      setData(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!user) return;
    void loadRequests();
  }, [loadRequests, user]);

  const summary: CampaignRequestSummary | null = data?.summary || null;
  const requests: CampaignRequestItem[] = data?.items || [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);
      await createCampaignRequest({ reason });
      setReason("");
      setMessage("Request submitted successfully. Admin will review it soon.");
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row">
      {sidebarOpen && (
        <button
          className="absolute inset-0 z-20 bg-slate-950/20 lg:hidden"
          type="button"
          aria-label="Close charity sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CharitySidebar
        isOpen={sidebarOpen}
        user={user}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 px-[6vw] py-12 lg:px-8">
        <header className="mb-10 block items-center justify-between sm:flex">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
              type="button"
              aria-label={sidebarOpen ? "Close charity sidebar" : "Open charity sidebar"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600 transition-all" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Campaign Requests
              </h1>
              <p className="mt-1.5 text-base text-slate-500">
                Request approval when your charity needs to exceed the monthly campaign limit.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Usage summary</h2>
              <p className="mt-1 text-sm text-slate-500">
                The system automatically calculates your current campaign usage.
              </p>
            </div>

            {summary ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "This month", value: summary.currentMonthCampaignCount },
                  { label: "Total hosted", value: summary.totalCampaignCount },
                  { label: "Active campaigns", value: summary.activeCampaignCount },
                  { label: "Pending requests", value: summary.pendingRequestCount },
                  { label: "Approved extra", value: summary.approvedAllowanceCount },
                  { label: "Monthly limit", value: summary.monthlyLimit },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-[#0b2b53]">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Loading summary...
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
              {summary?.hasExceededLimit
                ? "You have reached the monthly limit. Submit a request to create one more campaign."
                : "You can create up to 2 campaigns per month before requesting approval."}
            </div>

            {summary?.hasApprovedAllowance && (
              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800">
                An approved extra campaign allowance is available. It will be used automatically when you create your next campaign.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Request admin approval</h2>
              <p className="mt-1 text-sm text-slate-500">
                Explain why your charity needs an additional campaign.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={7}
                placeholder="Describe why your charity needs to host an extra campaign, your current fundraising needs, or any time-sensitive reason..."
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit request"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Your requests</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review submitted requests and their approval status.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`campaign-request-skeleton-${index}`}
                  className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No requests submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#0b2b53]">
                          Request submitted
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            request.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : request.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {request.reason}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{formatTime(request.requestedAt)}</span>
                        <span>
                          This month: {request.monthCampaignCount} · Total hosted: {request.totalCampaignCount} · Active: {request.activeCampaignCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
