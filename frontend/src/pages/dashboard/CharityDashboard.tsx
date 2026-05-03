import { useEffect, useState } from "react";
import type { User } from "../../types/auth";
import CharitySidebar from "../../components/CharitySidebar";

type CharityDashboardProps = {
  user: User;
};

export default function CharityDashboard({ user }: CharityDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

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
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 px-[6vw] py-12 lg:px-8">
        <header className="mb-10">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
              type="button"
              aria-label={sidebarOpen ? "Close charity sidebar" : "Open charity sidebar"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
              <span className="h-0.5 w-4 rounded-full bg-slate-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Here's an overview of your charity activity.
              </p>
            </div>
          </div>
        </header>

        {!user.isVerified && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">Verification pending</p>
            <p className="mt-1 text-sm text-amber-700/90">
              Your charity profile is submitted. An admin will review your document soon.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        </div>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-[#0b2b53]">Recent Contributions</h2>
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
                  d="M20 12H4M12 20V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <p className="font-medium text-slate-500">Nothing to show yet</p>
            <button className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-600 focus:outline-none">
              Create a Campaign
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
