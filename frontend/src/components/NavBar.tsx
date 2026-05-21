import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const isCharity = user?.role === "CHARITY";

  const publicNavLinks = [
    { label: "Home", href: "/" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "About", href: "/about" },
  ];

  const charityNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Campaigns", href: "/charity/campaigns" },
  ];

  const navLinks = isCharity ? charityNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-20 border-b border-[#e5ecf4] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-[6vw] py-4">
        <Link className="group inline-flex items-center gap-2" to="/">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b2b53] text-sm font-black text-white shadow-[0_10px_18px_rgba(11,43,83,0.2)] transition-transform group-hover:-translate-y-[1px]">
            C
          </span>
          <span className="text-[1.3rem] font-extrabold tracking-[-0.02em] text-[#0b2b53]">
            Charity<span className="text-emerald-500">Hub</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-2 rounded-full border border-[#dce8f4] bg-white/80 p-1 shadow-[0_8px_24px_rgba(10,40,80,0.06)] lg:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              className={({ isActive }) =>
                `rounded-full px-5 py-2 text-[0.95rem] font-semibold transition ${
                  isActive
                    ? "bg-[#0b2b53] text-white shadow-[0_8px_14px_rgba(11,43,83,0.2)]"
                    : "text-[#48617f] hover:bg-[#f2f8ff] hover:text-[#0b2b53]"
                }`
              }
              to={link.href}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!user ? (
            <Link
              className="hidden rounded-full border border-emerald-300 bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_22px_rgba(14,204,110,0.24)] transition hover:-translate-y-[1px] hover:bg-emerald-600 lg:inline-flex"
              to="/login"
            >
              Login
            </Link>
          ) : (
            <div className="relative hidden lg:block group">
              <button type="button" className="flex items-center focus:outline-none">
                <UserCircleIcon className="h-9 w-9 text-[#0b2b53] cursor-pointer hover:opacity-80 transition" />
              </button>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white py-2 shadow-lg ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <Link to="/settings" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                  Settings
                </Link>
                <Link to="/profile" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                  Edit Profile
                </Link>
                <div className="h-px bg-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce8f4] bg-white p-0 shadow-sm transition hover:bg-[#f2f8ff] lg:hidden"
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="relative flex h-5 w-6 items-center justify-center">
              <span
                className={`absolute h-0.5 w-6 rounded bg-[#0b2b53] transition ${
                  menuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
                }`}
              />
              <span
                className={`absolute h-0.5 w-6 rounded bg-[#0b2b53] transition ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute h-0.5 w-6 rounded bg-[#0b2b53] transition ${
                  menuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-30 border-b border-[#dce8f4] bg-white px-[6vw] pb-6 pt-4 shadow-[0_18px_40px_rgba(10,40,80,0.1)] lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-[0.98rem] font-semibold transition ${
                    isActive
                      ? "bg-[#0b2b53] text-white"
                      : "text-[#48617f] hover:bg-[#f2f8ff] hover:text-[#0b2b53]"
                  }`
                }
                to={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {!user ? (
              <Link
                className="mt-2 inline-flex w-fit rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_12px_20px_rgba(14,204,110,0.25)]"
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <UserCircleIcon className="h-10 w-10 text-[#0b2b53]" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/settings"
                  className="rounded-xl px-4 py-2.5 text-[0.98rem] font-semibold text-[#48617f] hover:bg-[#f2f8ff] hover:text-[#0b2b53] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/profile"
                  className="rounded-xl px-4 py-2.5 text-[0.98rem] font-semibold text-[#48617f] hover:bg-[#f2f8ff] hover:text-[#0b2b53] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full text-left rounded-xl px-4 py-2.5 text-[0.98rem] font-bold text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
