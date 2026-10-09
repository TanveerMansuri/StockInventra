import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({ 
  className = "", 
  variant = "primary", 
  loading = false, 
  disabled, 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-[8px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 h-[40px] px-16";
  
  const variants = {
    primary: "bg-primary text-surface hover:bg-primary-dark",
    secondary: "bg-ivory text-text-primary hover:bg-border",
    outline: "border border-border bg-transparent hover:bg-ivory text-text-primary",
    ghost: "bg-transparent hover:bg-ivory text-text-primary",
    danger: "bg-semantic-error text-surface hover:bg-semantic-error/90",
  };

  const currentVariantStyle = variants[variant];
  
  return (
    <button
      className={`${baseStyles} ${currentVariantStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-8 inline-block h-16 w-16 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status" />
      ) : null}
      {children}
    </button>
  );
}
