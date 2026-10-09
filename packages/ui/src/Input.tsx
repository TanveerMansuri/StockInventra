import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, description, error, required, id, ...props }, ref) => {

    // Auto-generate an id if none provided but we have a label
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="flex flex-col gap-4">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-text-primary">
            {label} {required && <span className="text-semantic-error">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`flex h-[52px] w-full bg-[#FDFCF9] rounded-[8px] border ${error ? 'border-semantic-error' : 'border-border'} bg-surface px-12 text-[16px] placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          required={required}
          {...props}
        />

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

Input.displayName = "Input";
