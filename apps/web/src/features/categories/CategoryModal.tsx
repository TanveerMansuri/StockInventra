import { useState, useRef, useEffect } from "react";
import { Folder, X, ChevronDown, Info } from "lucide-react";
import { categoriesService } from "../../services/api";

type CategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: { id: string; name: string; status: string } | null;
};

export function CategoryModal({ isOpen, onClose, onSuccess, categoryToEdit }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!categoryToEdit;

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setStatus(categoryToEdit.status);
      } else {
        setName("");
        setStatus("ACTIVE");
      }
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, categoryToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      let res;
      if (isEditMode) {
        res = await categoriesService.updateCategory(categoryToEdit.id, { name: trimmedName, status });
      } else {
        res = await categoriesService.createCategory({ name: trimmedName, status });
      }
      
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to save category.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-[#242124]/48 backdrop-blur-[2px]"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#FFFFFF] rounded-[16px] border border-[#EAE5E0] shadow-[0_20px_60px_rgba(36,33,36,0.18)] w-[650px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto flex flex-col p-[20px] md:p-[32px]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-[32px]">
          <div className="flex flex-row items-center gap-[22px]">
            <div className="w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-full bg-[#F8E9ED] flex items-center justify-center flex-shrink-0">
              <Folder className="text-[#7A1830] w-[28px] h-[28px] md:w-[36px] md:h-[36px]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <h2 id="modal-title" className="text-[24px] md:text-[28px] font-bold text-[#242124] leading-[30px] md:leading-[34px]">
                {isEditMode ? "Edit Category" : "Add Category"}
              </h2>
              <p className="text-[14px] md:text-[16px] text-[#77706D] leading-[20px] md:leading-[24px]">
                {isEditMode ? "Update an existing product category." : "Create a new product category."}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="w-[44px] h-[44px] bg-white border border-[#EAE5E0] rounded-[10px] flex items-center justify-center text-[#77706D] hover:bg-[#F5EFE6] hover:text-[#242124] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-[22px] h-[22px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Category Name */}
          <div className="flex flex-col gap-[10px] mb-[24px]">
            <label htmlFor="categoryName" className="text-[16px] font-medium text-[#242124] leading-[24px]">
              Category Name <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none">
                <Folder className="w-[22px] h-[22px] text-[#77706D]" />
              </div>
              <input
                id="categoryName"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                disabled={isSubmitting}
                placeholder="Enter category name..."
                className="w-full h-[64px] pl-[54px] pr-[18px] border border-[#EAE5E0] rounded-[12px] bg-[#FFFFFF] text-[17px] text-[#242124] placeholder:text-[#9A938F] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830] transition-shadow disabled:opacity-70"
              />
            </div>
            {error && <span className="text-[14px] text-[#DC2626] mt-[4px]">{error}</span>}
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-[10px] mb-[24px]">
            <label id="statusLabel" className="text-[16px] font-medium text-[#242124] leading-[24px]">
              Status <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-labelledby="statusLabel"
                disabled={isSubmitting}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-[64px] px-[18px] border border-[#EAE5E0] rounded-[12px] bg-[#FFFFFF] text-[17px] text-[#242124] flex items-center justify-between outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830] transition-shadow disabled:opacity-70"
              >
                <div className="flex items-center gap-[12px]">
                  <div className={`w-[8px] h-[8px] rounded-full ${status === 'ACTIVE' ? 'bg-[#16803D]' : 'bg-[#77706D]'}`} />
                  {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </div>
                <ChevronDown className={`w-[20px] h-[20px] text-[#77706D] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <ul
                  role="listbox"
                  className="absolute z-10 w-full mt-[8px] py-[8px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] shadow-[0_12px_24px_rgba(36,33,36,0.12)] overflow-hidden"
                >
                  <li
                    role="option"
                    aria-selected={status === 'ACTIVE'}
                    onClick={() => {
                      setStatus('ACTIVE');
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-[12px] px-[18px] py-[14px] hover:bg-[#F5EFE6] cursor-pointer transition-colors"
                  >
                    <div className="w-[8px] h-[8px] rounded-full bg-[#16803D]" />
                    <span className="text-[17px] text-[#242124]">Active</span>
                  </li>
                  <li
                    role="option"
                    aria-selected={status === 'INACTIVE'}
                    onClick={() => {
                      setStatus('INACTIVE');
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-[12px] px-[18px] py-[14px] hover:bg-[#F5EFE6] cursor-pointer transition-colors"
                  >
                    <div className="w-[8px] h-[8px] rounded-full bg-[#77706D]" />
                    <span className="text-[17px] text-[#242124]">Inactive</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Divider & Note */}
          <div className="border-t border-[#EAE5E0] mt-[24px] pt-[22px]">
            <div className="w-full min-h-[114px] p-[20px] bg-[#F8F2EA] rounded-[14px] flex flex-row items-start gap-[14px]">
              <div className="w-[44px] h-[44px] rounded-full bg-[#FBE6D4] flex items-center justify-center flex-shrink-0">
                <Info className="w-[22px] h-[22px] text-[#C96B24]" />
              </div>
              <div className="flex flex-col flex-1">
                <h4 className="text-[18px] font-semibold text-[#694321] mb-[4px]">Note</h4>
                <p className="text-[15px] text-[#77706D] leading-[23px]">
                  Categories help you organize your products better. You can add subcategories later if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-[30px] flex items-center justify-end gap-[14px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-[126px] h-[56px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] text-[#55504D] text-[16px] font-semibold hover:bg-[#F8F6F4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2 disabled:opacity-70 flex-shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[198px] h-[56px] bg-[#7A1830] rounded-[12px] text-[#FFFFFF] text-[16px] font-semibold hover:bg-[#641326] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2 disabled:opacity-70 flex-shrink-0 flex items-center justify-center"
            >
              {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Add Category")}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
