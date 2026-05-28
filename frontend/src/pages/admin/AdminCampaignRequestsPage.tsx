import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getApiErrorMessage } from "../../services/apiErrors";
import {
  approveCampaignRequest,
  getAdminCampaignRequests,
  rejectCampaignRequest,
} from "../../services/campaignRequest.api";
import type {
  AdminCampaignRequestsResponse,
  CampaignRequestItem,
} from "../../types/campaignRequest";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterSelect } from "../../components/ui/FilterSelect";
import CategoryDropdown from "../../components/ui/CategoryDropdown";

const statusTabs = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function AdminCampaignRequestsPage() {
  const [requests, setRequests] =
    useState<AdminCampaignRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusTabs)[number]>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [category, setCategory] = useState("ALL");

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminCampaignRequests({
        page,
        limit: 10,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        sortOrder,
      });
      setRequests(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, sortOrder]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const totalPages = requests?.totalPages || 1;
  const statusCounts = useMemo(
    () => ({
      ALL:
        (requests?.statusCounts.PENDING || 0) +
        (requests?.statusCounts.APPROVED || 0) +
        (requests?.statusCounts.REJECTED || 0),
      PENDING: requests?.statusCounts.PENDING || 0,
      APPROVED: requests?.statusCounts.APPROVED || 0,
      REJECTED: requests?.statusCounts.REJECTED || 0,
    }),
    [requests],
  );

  const handleAction = async (
    requestId: number,
    action: "approve" | "reject",
  ) => {
    try {
      setActionLoadingId(requestId);
      setActionMessage(null);
      if (action === "approve") {
        await approveCampaignRequest(requestId);
      } else {
        await rejectCampaignRequest(requestId);
      }
      setActionMessage(`Request ${action}d successfully.`);
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminShell
      title="Campaign Requests"
      description="Review charity requests for additional campaign slots and approve or reject them."
    >
      <div className="mb-6 flex items-center gap-3">
        <FilterSelect
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as any);
          }}
          defaultOption={{ value: "ALL", label: "All Status" }}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          containerClassName="w-44"
        />
        <CategoryDropdown
          value={category}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        />
        <div className="ml-3 text-xs text-slate-500">
          <span className="mr-2">PENDING ({statusCounts.PENDING})</span>
          <span className="mr-2">APPROVED ({statusCounts.APPROVED})</span>
          <span>REJECTED ({statusCounts.REJECTED})</span>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto]">
        <SearchInput
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search charity name or reason"
        />
        <FilterSelect
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as "asc" | "desc")
          }
          options={[
            { value: "desc", label: "Newest" },
            { value: "asc", label: "Oldest" },
          ]}
        />
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 flex items-center justify-center">
          {statusCounts.ALL} requests
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {actionMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`campaign-request-skeleton-${index}`}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : requests?.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No campaign requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests?.items.map((request: CampaignRequestItem) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-[#0b2b53]">
                      {request.charity.organizationName}
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
                  <p className="mt-1 text-xs text-slate-500">
                    {request.charity.user.name} · {request.charity.user.email}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {request.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>
                      Requested {new Date(request.requestedAt).toLocaleString()}
                    </span>
                    <span>This month: {request.monthCampaignCount}</span>
                    <span>Total hosted: {request.totalCampaignCount}</span>
                    <span>Active: {request.activeCampaignCount}</span>
                  </div>
                  {request.reviewedBy && request.reviewedAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      Reviewed by {request.reviewedBy.name} on{" "}
                      {new Date(request.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {request.status === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === request.id}
                      onClick={() => void handleAction(request.id, "approve")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionLoadingId === request.id
                        ? "Working..."
                        : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === request.id}
                      onClick={() => void handleAction(request.id, "reject")}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
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
      )}
    </AdminShell>
  );
}
