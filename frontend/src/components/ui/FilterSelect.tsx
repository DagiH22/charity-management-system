import React, { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: { value: string | number; label: string }[];
  containerClassName?: string;
  defaultOption?: { value: string | number; label: string };
}

export function FilterSelect({ options, containerClassName = '', className = '', defaultOption, ...props }: FilterSelectProps) {
  return (
    <div className={`relative ${containerClassName}`}>
      <select
        className={`block w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all hover:border-slate-300 cursor-pointer ${className}`}
        {...props}
      >
        {defaultOption && (
          <option value={defaultOption.value}>
            {defaultOption.label}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}
