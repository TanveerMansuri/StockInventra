import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageContainer({ 
  children, 
  className = "", 
  title, 
  description, 
  action 
}: PageContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl p-16 sm:p-24 ${className}`}>
      {(title || action) && (
        <div className="mb-20 flex flex-col gap-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h1 className="text-[32px] font-bold text-[#3C3834] leading-tight tracking-tight">{title}</h1>}
            {description && <p className="mt-[4px] text-[14px] text-[#77706D] font-medium">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
