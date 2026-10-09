import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";


export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-50 grid w-full max-w-lg gap-16 rounded-lg border border-border bg-surface p-24 shadow-lg sm:rounded-lg animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col space-y-8 text-center sm:text-left">
          <h2 className="text-section-title">{title}</h2>
          {description && (
            <p className="text-body text-text-secondary">
              {description}
            </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="absolute right-16 top-16 rounded-sm opacity-70 ring-offset-surface transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <X className="h-16 w-16 text-text-primary" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="py-16">
          {children}
        </div>
        
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-8">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
