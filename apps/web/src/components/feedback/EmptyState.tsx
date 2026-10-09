import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon = <FolderOpen className="h-48 w-48 text-text-secondary" /> 
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface p-32 text-center">
      <div className="mb-16 flex h-64 w-64 items-center justify-center rounded-full bg-background">
        {icon}
      </div>
      <h3 className="mb-8 text-section-title">{title}</h3>
      <p className="mb-24 max-w-sm text-body text-text-secondary">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
