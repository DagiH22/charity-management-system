import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type DashboardStatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  subtitleClassName?: string;
  iconWrapClassName?: string;
};

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  className,
  titleClassName,
  valueClassName,
  subtitleClassName,
  iconWrapClassName,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3
          className={cn(
            "text-xs font-bold uppercase tracking-wider text-slate-500",
            titleClassName,
          )}
        >
          {title}
        </h3>
        {icon ? (
          <div className={cn("rounded-lg bg-slate-50 p-2", iconWrapClassName)}>
            {icon}
          </div>
        ) : null}
      </div>

      <p className={cn("mt-4 text-3xl font-extrabold text-slate-900", valueClassName)}>
        {value}
      </p>

      {subtitle ? (
        <div className={cn("mt-2 text-sm text-slate-500", subtitleClassName)}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
