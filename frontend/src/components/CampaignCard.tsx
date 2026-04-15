import { Link } from "react-router-dom";

type CampaignCardProps = {
  title: string;
  description: string;
  raised: number;
  goal: number;
  to: string;
};

export default function CampaignCard({
  title,
  description,
  raised,
  goal,
  to,
}: CampaignCardProps) {
  const progress = Math.min((raised / goal) * 100, 100);

  return (
    <article className="group relative overflow-hidden bg-[#f7fbff] p-6 shadow-[0_14px_30px_rgba(10,40,80,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(10,40,80,0.08)]">
      <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-[linear-gradient(90deg,#10b981,#0b2b53)] opacity-80" />

      <div className="flex h-full flex-col">
        <div className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Featured Cause
        </div>

        <h3 className="mt-5 text-xl font-extrabold leading-snug text-[#0b2b53]">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#3d5674]">
            <span>${raised.toLocaleString()}</span>
            <span>${goal.toLocaleString()}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#0b2b53)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          className="mt-6 inline-flex w-fit items-center bg-[#edf6ff] px-5 py-2.5 text-sm font-bold text-[#0b2b53] transition hover:bg-emerald-50"
          to={to}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
