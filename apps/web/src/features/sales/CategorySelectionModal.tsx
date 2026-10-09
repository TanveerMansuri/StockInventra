import { useState, useEffect } from "react";
import { Search, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@stock-inventra/types";
import { createPortal } from "react-dom";

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function CategorySelectionModal({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  onSelect,
  isLoading,
  error
}: CategorySelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-[#FFFFFF] w-full max-w-[560px] max-h-[calc(100vh-48px)] h-[min(680px,100%)] rounded-[16px] border border-[#EAE5E0] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-[24px] pb-[16px] border-b border-[#EAE5E0]">
          <div>
            <h2 className="text-[22px] font-bold text-[#242124]">Select Category</h2>
            <p className="text-[14px] text-[#77706D] mt-[4px]">Choose a category to filter available products.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#F5EFE6] text-[#77706D] hover:text-[#7A1830] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-[24px] pt-[20px] flex-1 flex flex-col overflow-hidden">
          <div className="relative mb-[16px]">
            <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
              <Search size={18} className="text-[#77706D]" />
            </div>
            <input 
              type="text"
              autoFocus
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-[46px] pl-[40px] pr-[16px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[15px] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#77706D]">Loading categories...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#C62828]">{error}</div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#77706D]">No categories found.</div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {paginatedCategories.map(cat => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelect(cat.id)}
                      className={`w-full flex items-center justify-between min-h-[56px] px-[14px] rounded-[8px] transition-colors text-left
                        ${isSelected ? 'bg-[#7A1830]/5 border border-[#7A1830]/20' : 'hover:bg-[#F5EFE6] border border-transparent'}`}
                    >
                      <span className={`text-[15px] font-medium ${isSelected ? 'text-[#7A1830]' : 'text-[#242124]'}`}>
                        {cat.name}
                      </span>
                      {isSelected && <Check size={18} className="text-[#7A1830]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!isLoading && !error && filteredCategories.length > 0 && (
          <div className="p-[20px] border-t border-[#EAE5E0] flex items-center justify-between bg-[#FCFCFB] rounded-b-[16px]">
            <span className="text-[14px] text-[#77706D]">
              Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
            </span>
            <div className="flex items-center gap-[8px]">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] hover:bg-[#F5EFE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#242124]"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] hover:bg-[#F5EFE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#242124]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
