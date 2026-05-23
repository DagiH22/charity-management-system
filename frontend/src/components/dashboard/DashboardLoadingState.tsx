type DashboardLoadingStateProps = {
  statCards?: number;
  sectionCards?: number;
  className?: string;
};

export default function DashboardLoadingState({
  statCards = 5,
  sectionCards = 2,
  className,
}: DashboardLoadingStateProps) {
  return (
    <div className={className || "space-y-8"}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: statCards }).map((_, index) => (
          <div
            key={`dashboard-stat-skeleton-${index}`}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-8 w-28 rounded-full bg-slate-200" />
            <div className="mt-3 h-3 w-20 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: sectionCards }).map((_, index) => (
          <div
            key={`dashboard-section-skeleton-${index}`}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-4 w-40 rounded-full bg-slate-200" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div
                  key={`dashboard-row-skeleton-${index}-${rowIndex}`}
                  className="h-10 rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
