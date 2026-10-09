import { Trash2 } from "lucide-react";

type DeleteProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isDeleting: boolean;
};

export function DeleteProductModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName,
  isDeleting
}: DeleteProductModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-[#242124]/48"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFFFFF] rounded-[18px] border border-[#EAE5E0] shadow-[0_20px_60px_rgba(36,33,36,0.18)] w-[440px] max-w-[calc(100vw-32px)] p-[28px] flex flex-col items-center text-center">
        
        <div className="w-[56px] h-[56px] rounded-full bg-[#FEF2F2] flex items-center justify-center mb-[20px]">
          <Trash2 className="w-[26px] h-[26px] text-[#DC2626]" />
        </div>

        <h3 className="text-[22px] font-bold text-[#242124] leading-tight mb-[8px]">
          Delete Product?
        </h3>
        
        <p className="text-[14px] text-[#77706D] leading-[22px] mb-[28px]">
          Are you sure you want to delete "{productName}"? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-[12px] w-full mt-auto">
          <button 
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-[46px] px-[20px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[#242124] font-medium hover:bg-[#F8F6F4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2 disabled:opacity-70 flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-[46px] px-[20px] bg-[#DC2626] rounded-[10px] text-[#FFFFFF] font-medium hover:bg-[#B91C1C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2 disabled:opacity-70 flex-1 sm:flex-none flex items-center justify-center"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
