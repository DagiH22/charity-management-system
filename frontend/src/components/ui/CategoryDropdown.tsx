import { useEffect, useRef, useState } from "react";
import {
  campaignCategoryOptions,
  getCampaignCategoryLabel,
} from "../../utils/campaignCategories";
import { ChevronDown } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export default function CategoryDropdown({
  value,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition"
      >
        <span className="truncate max-w-[160px]">
          {value === "ALL" ? "All Categories" : getCampaignCategoryLabel(value)}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-lg">
          <div className="p-3">
            <button
              onClick={() => {
                onChange("ALL");
                setOpen(false);
              }}
              className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm ${value === "ALL" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-700"}`}
            >
              All Categories
            </button>
            <div className="max-h-44 overflow-y-auto pr-2">
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
