import React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    
    const checkboxId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-8">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={`peer h-16 w-16 appearance-none rounded-sm border ${error ? 'border-semantic-error' : 'border-border'} bg-surface checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
              {...props}
            />
            <Check className="pointer-events-none absolute h-12 w-12 text-surface opacity-0 peer-checked:opacity-100" />
          </div>
          {label && (
            <label htmlFor={checkboxId} className="text-body text-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="text-small text-semantic-error">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
