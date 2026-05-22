import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  Bars3Icon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";

interface CharityHeaderProps {
  onMenuClick: () => void;
}

export default function CharityHeader({ onMenuClick }: CharityHeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:text-slate-900 transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <Link to="/dashboard" className="hidden lg:flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b2b53] text-sm font-bold text-white shadow-sm">
              C
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0b2b53]">
              Charity<span className="text-emerald-500">Hub</span>{" "}
              <span className="text-slate-400 font-medium ml-1 text-sm">
                Dashboard
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationBell
            buttonClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
            iconClassName="h-5 w-5"
          />

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200"
            aria-hidden="true"
          />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-slate-50 rounded-full transition-colors"
              id="user-menu-button"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              <span className="sr-only">Open user menu</span>
              {user?.profileImage ? (
                <img
                  className="h-8 w-8 rounded-full bg-slate-50 object-cover ring-1 ring-slate-200"
                  src={user.profileImage}
                  alt=""
                />
              ) : (
                <UserCircleIcon
                  className="h-8 w-8 text-slate-400"
                  aria-hidden="true"
                />
              )}
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="ml-4 text-sm font-semibold leading-6 text-slate-900"
                  aria-hidden="true"
                >
                  {user?.name || "Charity User"}
                </span>
              </span>
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 z-40 mt-2.5 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-slate-900/5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/charity-profile/setup"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2 text-slate-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-red-500" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
