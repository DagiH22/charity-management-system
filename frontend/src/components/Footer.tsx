import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Campaigns", to: "/campaigns" },
  { label: "About", to: "/about" },
  { label: "Login", to: "/login" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#d9e6f2] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
      <div className="mx-auto max-w-[1200px] px-[6vw] py-12">
        <div className="grid grid-cols-1 gap-10 rounded-[32px] border border-[#d9e6f2] bg-white/80 px-6 py-8 shadow-[0_20px_50px_rgba(10,40,80,0.08)] backdrop-blur sm:px-8 lg:grid-cols-[1.3fr_0.8fr_1fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b53] text-sm font-black text-white shadow-[0_10px_20px_rgba(11,43,83,0.22)]">
                C
              </span>
              <span className="text-2xl font-extrabold tracking-[-0.02em] text-[#0b2b53]">
                Charity<span className="text-emerald-500">Hub</span>
              </span>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              We connect people who want to help with communities that need
              support most, turning generosity into education, food, and hope.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#0b2b53]">
              Quick Links
            </h3>
            <div className="mt-5 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  className="w-fit text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#0b2b53]">
              Join the Mission
            </h3>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Every donation helps fund urgent campaigns and community-driven
              programs.
            </p>
            <Link
              className="mt-6 inline-flex rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_22px_rgba(14,204,110,0.24)] transition hover:-translate-y-[1px] hover:bg-emerald-600"
              to="/campaigns"
            >
              Explore Campaigns
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 CharityHub. All rights reserved.</p>
          <p>Built to support causes that matter.</p>
        </div>
      </div>
    </footer>
  );
}
