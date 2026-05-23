import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#f2f8ff] to-white px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#dce8f4] bg-white p-8 text-center shadow-[0_20px_60px_rgba(10,40,80,0.12)] md:p-12">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-extrabold text-emerald-600">
          404
        </div>

        <h1 className="text-3xl font-extrabold text-[#0b2b53] md:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            Go Home
          </Link>
          <Link
            to="/campaigns"
            className="rounded-xl border border-[#dce8f4] bg-white px-5 py-2.5 text-sm font-bold text-[#0b2b53] transition hover:bg-[#f2f8ff]"
          >
            Browse Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
