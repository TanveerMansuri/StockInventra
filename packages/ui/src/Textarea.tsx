import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, description, error, required, id, ...props }, ref) => {
    
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className="flex flex-col gap-4">
        {label && (
          <label htmlFor={textareaId} className="text-body-strong text-text-primary">
            {label} {required && <span className="text-semantic-error">*</span>}
          </label>
        )}
        
        <textarea
          id={textareaId}
          ref={ref}
          className={`flex min-h-[80px] w-full rounded-md border ${error ? 'border-semantic-error' : 'border-border'} bg-surface px-12 py-8 text-body placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

Textarea.displayName = "Textarea";
