import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(10,40,80,0.05)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-[6vw] py-5">
        <a
          className="text-[1.6rem] font-extrabold tracking-[-0.02em] text-[#0b2b53]"
          href="/"
        >
          Charity<span className="text-emerald-500">.</span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              className="text-[0.98rem] font-semibold text-[#3a5270] transition-colors hover:text-[#0b2b53]"
              to={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            className="hidden rounded-lg bg-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-[0_12px_20px_rgba(14,204,110,0.25)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_24px_rgba(14,204,110,0.32)] lg:inline-flex"
            to="/donate"
          >
            Donate
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/80 bg-white p-0 lg:hidden"
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
        <div className="absolute left-0 right-0 top-full z-20 flex flex-col gap-4 border-b border-slate-200/70 bg-white px-[6vw] pb-6 pt-4 shadow-[0_18px_40px_rgba(10,40,80,0.08)] lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              className="font-semibold text-[#3a5270]"
              to={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="inline-flex w-fit rounded-lg bg-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-[0_12px_20px_rgba(14,204,110,0.25)]"
            to="/donate"
          >
            Donate
          </Link>
        </div>
      )}
    </header>
  );
}
