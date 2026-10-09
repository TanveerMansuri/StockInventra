

export interface DateRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto gap-[8px] pb-2 sm:pb-0 w-full sm:w-auto -mx-16 px-16 sm:mx-0 sm:px-0">
      {[
        { id: "thisMonth", label: "This Month" },
        { id: "last3Months", label: "Last 3 Months" },
        { id: "last6Months", label: "Last 6 Months" },
        { id: "last12Months", label: "Last 12 Months" },
        { id: "custom", label: "Custom Range" },
      ].map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-shrink-0 flex h-[38px] items-center justify-center rounded-[8px] border px-[16px] text-[13px] leading-[20px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/30 ${
              opt.id === "custom" ? "min-w-[150px]" : "min-w-[140px]"
            } ${
              isActive
                ? "bg-[#781529] text-[#FFFFFF] border-[#781529] font-semibold"
                : "bg-[#FFFFFF] text-[#77706D] border-[#EAE5E0] font-medium hover:bg-[#FAF5EE]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
