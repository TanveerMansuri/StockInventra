import React from "react";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", label, id, ...props }, ref) => {
    
    const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className="flex items-center gap-8">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            className={`peer sr-only ${className}`}
            {...props}
          />
          <div className="h-24 w-40 rounded-full bg-border transition-colors peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
          <div className="absolute left-4 top-4 h-16 w-16 rounded-full bg-surface transition-transform peer-checked:translate-x-16"></div>
        </div>
        {label && (
          <label htmlFor={switchId} className="text-body text-text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
