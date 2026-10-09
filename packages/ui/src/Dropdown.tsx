import React, { useState, useRef, useEffect } from "react";

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "left", className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-8 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-4 shadow-md animate-in fade-in zoom-in-95 ${align === "right" ? "right-0" : "left-0"} ${className}`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-8 py-6 text-body outline-none transition-colors hover:bg-background focus:bg-background focus:text-text-primary disabled:pointer-events-none disabled:opacity-50 text-text-primary"
              disabled={item.disabled}
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="mr-8 flex h-16 w-16 items-center justify-center">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
