import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { User } from "../types/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "About", href: "/about" },
];

type NavBarProps = {
  user: User | null;
  onLogout: () => void;
};

export default function NavBar({ user, onLogout }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          {user && (
            <Link
              className="text-[0.98rem] font-semibold text-[#3a5270] transition-colors hover:text-[#0b2b53]"
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
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
            <>
              <Link
                className="hidden rounded-full border border-[#dce8f4] bg-white px-5 py-2 text-sm font-semibold text-[#0b2b53] lg:inline-flex"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <button
                className="hidden rounded-full bg-[#0b2b53] px-5 py-2 text-sm font-semibold text-white lg:inline-flex"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </>
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
              <div className="mt-2 flex items-center gap-3">
                <Link
                  className="inline-flex w-fit rounded-full bg-[#0b2b53] px-6 py-2.5 text-sm font-bold text-white"
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="inline-flex w-fit rounded-full border border-[#dce8f4] bg-white px-6 py-2.5 text-sm font-bold text-[#0b2b53]"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout()
                  }}
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
