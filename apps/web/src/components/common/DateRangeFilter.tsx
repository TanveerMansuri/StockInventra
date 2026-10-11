

export interface DateRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export function DateRangeFilter({ value, onChange, startDate, endDate, onCustomDateChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-[12px] mb-[24px]">
      <div className="flex flex-wrap gap-[8px]">
        {[
          { id: "today", label: "Today" },
          { id: "thisWeek", label: "This Week" },
          { id: "thisMonth", label: "This Month" },
          { id: "thisYear", label: "This Year" },
          { id: "custom", label: "Custom Range" },
        ].map((opt) => {
          const isActive = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`flex-shrink-0 flex h-[38px] items-center justify-center rounded-[8px] border px-[16px] text-[13px] leading-[20px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/30 ${
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
      
      {value === "custom" && onCustomDateChange && (
        <div className="flex items-center gap-[12px] p-[12px] border border-[#EAE5E0] bg-[#FFFFFF] rounded-[8px] w-fit">
          <div className="flex flex-col">
            <label className="text-[12px] text-[#77706D] font-medium mb-[4px]">Start Date</label>
            <input 
              type="date" 
              value={startDate || ""}
              onChange={(e) => onCustomDateChange(e.target.value, endDate || "")}
              className="h-[36px] px-[12px] border border-[#EAE5E0] rounded-[6px] text-[14px] focus:outline-none focus:border-[#781529]"
            />
          </div>
          <span className="text-[#77706D] mt-[20px]">-</span>
          <div className="flex flex-col">
            <label className="text-[12px] text-[#77706D] font-medium mb-[4px]">End Date</label>
            <input 
              type="date" 
              value={endDate || ""}
              onChange={(e) => onCustomDateChange(startDate || "", e.target.value)}
              className="h-[36px] px-[12px] border border-[#EAE5E0] rounded-[6px] text-[14px] focus:outline-none focus:border-[#781529]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
