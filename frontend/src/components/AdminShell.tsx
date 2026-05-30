import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

type AdminShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
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
          aria-label="Close admin sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1 px-[6vw] py-12 lg:px-8">
        <header className="mb-10 block items-center justify-between sm:flex">
          <div className="flex items-start gap-4">
            <button
              className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:hidden"
              type="button"
              aria-label={sidebarOpen ? "Close admin sidebar" : "Open admin sidebar"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
              <span className="h-0.5 w-5 rounded-full bg-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="mt-1.5 text-base text-slate-500">{description}</p>
            </div>
          </div>
          {actions ? <div className="mt-4 sm:mt-0">{actions}</div> : null}
        </header>

        {children}
      </div>
    </div>
  );
}
