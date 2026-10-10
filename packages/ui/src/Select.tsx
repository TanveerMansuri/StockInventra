import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, description, error, required, id, options, ...props }, ref) => {
    
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className="flex flex-col gap-4">
        {label && (
          <label htmlFor={selectId} className="text-body-strong text-text-primary">
            {label} {required && <span className="text-semantic-error">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`flex h-[52px] w-full appearance-none rounded-[8px] border ${error ? 'border-semantic-error' : 'border-border'} bg-surface px-12 pr-32 text-[16px] text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            required={required}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-12 top-1/2 h-16 w-16 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
        
        {description && !error && (
          <p className="text-small text-text-secondary">{description}</p>
        )}
        
        {error && (
          <p className="text-small text-semantic-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
