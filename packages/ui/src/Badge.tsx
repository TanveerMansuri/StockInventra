import React from "react";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className = "", variant = "neutral", ...props }: BadgeProps) {
  
  const variants = {
    neutral: "bg-background border border-border text-text-secondary",
    success: "bg-semantic-success-bg text-semantic-success border border-semantic-success/20",
    warning: "bg-semantic-warning-bg text-semantic-warning border border-semantic-warning/20",
    danger: "bg-semantic-error-bg text-semantic-error border border-semantic-error/20",
    info: "bg-semantic-info-bg text-semantic-info border border-semantic-info/20",
    primary: "bg-primary text-surface border border-primary",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-12 py-4 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
