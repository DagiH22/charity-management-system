import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import DonorSidebar from "../components/DonorSidebar";
import { useAuthStore } from "../store/authStore";
import { LockKeyhole } from "lucide-react";

export default function DonorLayout() {
  const { user } = useAuthStore();
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

  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/50 p-8 text-center backdrop-blur-sm shadow-sm ring-1 ring-black/5">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-8 ring-slate-50">
            <LockKeyhole className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-[#0b2b53]">
            Authentication Required
          </h2>
          <p className="mb-8 max-w-md text-slate-500">
            You must be logged into a Donor account to view this page. Please
            sign in or create a new account to continue.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex min-w-[140px] items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] ring-1 ring-inset ring-emerald-500 transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex min-w-[140px] items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      );
    }
    return <Outlet />;
  };

  return (
    <div className="relative -mx-[6vw] -my-12 flex min-h-[calc(100vh-73px)] lg:flex-row bg-slate-50/30">
      <DonorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1 px-[6vw] py-8 lg:px-8 lg:py-12 flex flex-col">
        <div className="mb-4 lg:hidden">
          <button
            className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
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
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
