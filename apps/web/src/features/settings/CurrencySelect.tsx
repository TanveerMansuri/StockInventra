import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { CURRENCIES } from "@stock-inventra/utils";

interface CurrencySelectProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
  error?: string;
}

export function CurrencySelect({ value, onChange, label, error }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = CURRENCIES.find((c) => c.code === value) || CURRENCIES.find((c) => c.code === 'USD');

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 relative" ref={dropdownRef}>
      {label && (
        <label className="text-[13px] font-medium text-[#242124]">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between h-[52px] w-full bg-[#FCFCFB] rounded-[8px] border ${
          error ? "border-[#C62828]" : isOpen ? "border-[#7A1830]" : "border-[#EAE5E0]"
        } px-12 text-[16px] text-[#242124] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7A1830]/30 transition-colors`}
      >
        {selectedCurrency ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#7A1830]">{selectedCurrency.symbol}</span>
            <span>{selectedCurrency.name} ({selectedCurrency.code})</span>
          </div>
        ) : (
          <span className="text-[#77706D]">Select a currency</span>
        )}
        <ChevronDown size={18} className="text-[#77706D]" />
      </button>

      {error && <p className="text-small text-[#C62828] mt-[4px]">{error}</p>}

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] shadow-lg overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#EAE5E0] relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-[#77706D]" />
            </div>
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[40px] pl-[32px] pr-[12px] bg-[#F5EFE6] border-none rounded-[6px] text-[14px] text-[#242124] placeholder:text-[#77706D] focus:outline-none focus:ring-1 focus:ring-[#7A1830]/30"
              autoFocus
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto py-2">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-[#F5EFE6] transition-colors ${
                    value === currency.code ? "bg-[#F5EFE6] text-[#7A1830]" : "text-[#242124]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#7A1830]">{currency.symbol}</span>
                    <span className="text-[14px]">{currency.name}</span>
                    <span className="text-[12px] text-[#77706D] ml-1">
                      ({currency.code})
                    </span>
                  </div>
                  {value === currency.code && <Check size={16} className="text-[#7A1830]" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-[14px] text-[#77706D]">
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
