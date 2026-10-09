import React, { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = "", value, onClear, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-12">
          <Search className="h-16 w-16 text-text-secondary" />
        </div>
        <input
          ref={ref}
          type="text"
          className={`block h-10 w-full rounded-md border border-border bg-background py-8 pl-40 pr-32 text-body placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
          value={value}
          onChange={onChange}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-12 text-text-secondary hover:text-text-primary"
            onClick={onClear}
          >
            <X className="h-16 w-16" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
