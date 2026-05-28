import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { getApiErrorMessage } from "../../services/apiErrors";
import { getAdminUsers } from "../../services/adminDashboard.api";
import type { AdminUsersResponse } from "../../types/adminDashboard";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterSelect } from "../../components/ui/FilterSelect";
import CategoryDropdown from "../../components/ui/CategoryDropdown";

const roleTabs = ["ALL", "DONOR", "CHARITY", "ADMIN"] as const;

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof roleTabs)[number]>("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "email">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminUsers({
          page,
          limit: 12,
          search: search || undefined,
          role: role === "ALL" ? undefined : role,
          sortBy,
          sortOrder,
        });
        setUsers(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [page, role, search, sortBy, sortOrder]);

  const totalPages = users?.totalPages || 1;
  const userItems = users?.items || [];

  const totalCountLabel = useMemo(() => {
    if (!users) {
      return 0;
    }

    if (role === "ALL") {
      return users.total;
    }

    return users.roleCounts[role];
  }, [role, users]);

  return (
    <AdminShell
      title="User Management"
      description="Browse all registered users, filter by role, and monitor account verification."
    >
      <div className="mb-6 flex items-center gap-3">
        <FilterSelect
          value={role}
          onChange={(e) => {
            setRole(e.target.value as any);
            setPage(1);
          }}
          defaultOption={{ value: "ALL", label: "All Roles" }}
          options={[
            { value: "DONOR", label: "Donor" },
            { value: "CHARITY", label: "Charity" },
            { value: "ADMIN", label: "Admin" },
          ]}
          containerClassName="w-44"
        />
        <CategoryDropdown
          value={category}
          onChange={(v) => {
            setCategory(v);
            // category irrelevant for users, kept for visual consistency
          }}
        />
        <div className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 flex items-center justify-center">
          {totalCountLabel} users
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.6fr_auto]">
        <SearchInput
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search name, email, or organization"
        />
        <FilterSelect
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
          options={[
            { value: "createdAt", label: "Newest" },
            { value: "name", label: "Name" },
            { value: "email", label: "Email" },
          ]}
        />
        <FilterSelect
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as "asc" | "desc")
          }
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" },
          ]}
        />
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 flex items-center justify-center">
          {totalCountLabel} users
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`admin-users-skeleton-${index}`}
              className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : userItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {userItems.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0b2b53]">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.charityProfile && (
                      <p className="mt-1 text-xs text-slate-500">
                        {user.charityProfile.organizationName}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.role === "CHARITY" ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.charityProfile?.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.charityProfile?.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {user.charityProfile?.status || "PENDING"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
