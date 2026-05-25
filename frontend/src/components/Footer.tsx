import { Link } from "react-router-dom";
import { HeartIcon as Heart } from "@heroicons/react/24/solid";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Campaigns", to: "/campaigns" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

const socialLinks = [
  { icon: () => <span className="text-sky-500">🐦</span>, href: "https://twitter.com", label: "Twitter" },
  { icon: () => <span className="text-slate-800">💻</span>, href: "https://github.com", label: "GitHub" },
  { icon: () => <span className="text-blue-700">💼</span>, href: "https://linkedin.com", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#d9e6f2] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)]">
      <div className="mx-auto max-w-[1200px] px-[6vw] py-14">
        <div className="grid grid-cols-1 gap-10 rounded-[32px] border border-[#d9e6f2] bg-white/80 px-6 py-10 shadow-[0_20px_50px_rgba(10,40,80,0.08)] backdrop-blur sm:px-8 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr] lg:px-10">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2b53] text-sm font-black text-white shadow-[0_10px_20px_rgba(11,43,83,0.22)]">
                C
              </span>
              <span className="text-2xl font-extrabold tracking-[-0.02em] text-[#0b2b53]">
                Charity<span className="text-emerald-500">Hub</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-600">
              We connect people who want to help with communities that need
              support most, turning generosity into education, food, and hope.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md"
                >
                  <span className="h-4 w-4 inline-flex items-center justify-center text-sm">
                    {social.icon()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#0b2b53]">
              Quick Links
            </h3>
            <div className="mt-5 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  className="w-fit text-sm font-semibold text-slate-600 transition hover:translate-x-1 hover:text-emerald-600"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#0b2b53]">
              Contact
            </h3>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500">📧</span>
                <span className="text-sm leading-6 text-slate-600">support@charityhub.org</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500">📍</span>
                <span className="text-sm leading-6 text-slate-600">Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#0b2b53]">
              Join the Mission
            </h3>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Every donation helps fund urgent campaigns and community-driven
              programs.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_22px_rgba(14,204,110,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_14px_28px_rgba(14,204,110,0.3)]"
              to="/campaigns"
            >
              <Heart className="h-4 w-4" />
              Explore Campaigns
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CharityHub. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 text-emerald-500" /> to
            support causes that matter.
          </p>
        </div>
      </div>
    </footer>
  );
}
