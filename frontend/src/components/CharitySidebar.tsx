import { Link } from "react-router-dom";
import type { User } from "../types/auth";

type CharitySidebarProps = {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
};

const navigationItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create Campaign", href: "/dashboard/create-campaign" },
  { label: "My Campaigns", href: "/dashboard#my-campaigns" },
  { label: "Donations Summary", href: "/dashboard#donations-summary" },
  { label: "Notifications", href: "/dashboard#notifications" },
  { label: "Profile / Organization Info", href: "/dashboard#organization-profile" },
  { label: "Settings", href: "/dashboard#settings" },
];

export default function CharitySidebar({
  isOpen,
  onClose,
}: CharitySidebarProps) {
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose();
    }
  };

  return (
    <aside
      className={`absolute bottom-0 left-0 top-0 z-30 w-72 shrink-0 border-r border-slate-200 bg-slate-100 px-3 py-5 transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-2 pb-4">
        <button
          className="inline-flex ml-[85%] h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-[#0b2b53]"
          type="button"
          aria-label="Close charity sidebar"
          onClick={onClose}
        >
          x
        </button>
      </div>

      <nav className="space-y-1" aria-label="Charity dashboard">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 hover:text-[#0b2b53]"
            to={item.href}
            onClick={closeOnMobile}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
