import React, { useState } from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-8",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-8",
    left: "right-full top-1/2 -translate-y-1/2 mr-8",
    right: "left-full top-1/2 -translate-y-1/2 ml-8",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 overflow-hidden rounded-md bg-text-primary px-12 py-6 text-caption text-surface animate-in fade-in zoom-in-95 whitespace-nowrap ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
