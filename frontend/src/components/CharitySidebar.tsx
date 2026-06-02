import { Link, useLocation } from "react-router-dom";
import { cn } from "../utils/cn";
import {
  HomeIcon,
  PlusCircleIcon,
  RectangleGroupIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type CharitySidebarProps = {
  isOpen: boolean;
  user?: unknown;
  onClose: () => void;
};

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  {
    label: "Create Campaign",
    href: "/dashboard/create-campaign",
    icon: PlusCircleIcon,
  },
  {
    label: "My Campaigns",
    href: "/charity/campaigns",
    icon: RectangleGroupIcon,
  },
  {
    label: "All Campaigns",
    href: "/campaigns",
    icon: GlobeAltIcon,
  },
  {
    label: "Contributions",
    href: "/charity/contributions",
    icon: CurrencyDollarIcon,
  },
  {
    label: "Campaign Requests",
    href: "/charity/campaign-requests",
    icon: ClipboardDocumentListIcon,
  },
];

export default function CharitySidebar({
  isOpen,
  onClose,
}: CharitySidebarProps) {
  const location = useLocation();

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className="hidden w-72 shrink-0 lg:block" aria-hidden="true" />

      {/* Sidebar component */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex-col overflow-hidden bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out h-[100dvh] lg:fixed lg:top-[81px] lg:bottom-0 lg:z-30 lg:flex lg:h-[calc(100vh-81px)] lg:w-72 lg:translate-x-0 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0 flex" : "-translate-x-full hidden",
        )}
      >
        <div className="flex shrink-0 items-center justify-between px-6 h-16 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b2b53] text-sm font-bold text-white shadow-sm">
              C
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0b2b53]">
              Charity<span className="text-emerald-500">Hub</span>
            </span>
          </div>
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-500 hover:text-slate-700 transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-6 pb-4"
          aria-label="Sidebar"
        >
          <div className="px-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/dashboard" &&
                  location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={closeOnMobile}
                  className={cn(
                    "group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-600",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
