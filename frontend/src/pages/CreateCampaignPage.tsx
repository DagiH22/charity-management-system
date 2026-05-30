import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CharitySidebar from "../components/CharitySidebar";
import CreateCampaignForm from "../components/CreateCampaignForm";
import { useAuthStore } from "../store/authStore";

export default function CreateCampaignPage() {
  const { user } = useAuthStore();
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

  if (!user) {
    return null;
  }

  if (user.role !== "CHARITY") {
    return <Navigate to="/dashboard" replace />;
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
        <header className="mb-10">
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

            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Create Campaign
              </h1>
              <p className="mt-1.5 text-base text-slate-500">
                Start a new fundraising campaign to support your cause.
              </p>
            </div>
          </div>
        </header>

        <CreateCampaignForm />
      </div>
    </div>
  );
}
