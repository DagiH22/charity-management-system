import type { User } from "../../types/auth";

type DonorDashboardProps = {
  user: User;
};

export default function DonorDashboard({ user }: DonorDashboardProps) {
  return (
    <div className="mx-auto max-w-[1200px] py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0b2b53]">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          Here's an overview of your giving activity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Account Status
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">
            {user.isVerified ? "Verified" : "Pending"}
          </p>
          <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {user.role}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Total Donated
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">$0.00</p>
          <p className="mt-2 text-sm text-slate-500">Across 0 campaigns</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Impact Score
          </h3>
          <p className="mt-4 text-3xl font-extrabold text-[#0b2b53]">New</p>
          <p className="mt-2 text-sm text-slate-500">Start donating to grow!</p>
        </div>
      </div>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(10,40,80,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <h2 className="text-xl font-bold text-[#0b2b53]">Recent Donations</h2>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
            View All
          </button>
        </div>
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-slate-100 p-4">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 12H4M12 20V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="font-medium text-slate-500">Nothing to show yet</p>
          <button className="mt-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-600 focus:outline-none">
            Find a Campaign
          </button>
        </div>
      </section>
    </div>
  );
}
