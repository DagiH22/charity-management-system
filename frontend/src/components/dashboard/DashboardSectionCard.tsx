import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type DashboardSectionCardProps = {
  title?: ReactNode;
  action?: ReactNode;
  headerClassName?: string;
  className?: string;
  children: ReactNode;
};

export default function DashboardSectionCard({
  title,
  action,
  headerClassName,
  className,
  children,
}: DashboardSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {title || action ? (
        <div className={cn("mb-5 flex items-center justify-between", headerClassName)}>
          {title ? <h2 className="text-xl font-bold text-slate-900">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}

      {children}
    </section>
  );
}
