import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { campaignCategoryOptions } from "../../utils/campaignCategories";

type Props = {
  value: string;
  onChange: (v: string) => void;
  status: string;
  onStatusChange: (s: string) => void;
};

export default function CategoryFilterDropdown({
  value,
  onChange,
  status,
  onStatusChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition"
      >
        <span className="truncate max-w-[180px]">
          {value === "ALL"
            ? "All Categories"
            : campaignCategoryOptions.find((c) => c.value === value)?.label}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-lg">
          <div className="p-3">
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                Status
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange("ALL")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${status === "ALL" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600"}`}
                >
                  All
                </button>
                <button
                  onClick={() => onStatusChange("ACTIVE")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => onStatusChange("CLOSED")}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${status === "CLOSED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600"}`}
                >
                  Closed
                </button>
              </div>
            </div>

            <p className="mb-2 text-xs font-semibold text-slate-500">
              Categories
            </p>
            <div className="max-h-44 overflow-y-auto pr-2">
              <button
                onClick={() => {
                  onChange("ALL");
                  setOpen(false);
                }}
                className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm ${value === "ALL" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-700"}`}
              >
                All Categories
              </button>
              {campaignCategoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm ${value === opt.value ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
