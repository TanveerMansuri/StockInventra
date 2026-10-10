import { useState, useEffect } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@stock-inventra/types";
import { createPortal } from "react-dom";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  isLoading: boolean;
  error: string | null;
  categoryName?: string;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSelect,
  isLoading,
  error,
  categoryName
}: ProductSelectionModalProps) {
  const formatCurrency = useCurrencyFormatter();
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

  const filteredProducts = products.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower);
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-[#FFFFFF] w-full max-w-[760px] max-h-[calc(100vh-48px)] h-[min(760px,100%)] rounded-[16px] border border-[#EAE5E0] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-[24px] pb-[16px] border-b border-[#EAE5E0]">
          <div>
            <h2 className="text-[22px] font-bold text-[#242124]">Select Product</h2>
            <p className="text-[14px] text-[#77706D] mt-[4px]">Search and select a product to add to this sale.</p>
            {categoryName && (
              <div className="mt-[8px] inline-flex items-center px-[8px] py-[4px] bg-[#F5EFE6] rounded-[6px] text-[12px] font-medium text-[#7A1830]">
                Category: {categoryName}
              </div>
            )}
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
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-[46px] pl-[40px] pr-[16px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[15px] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#77706D]">Loading products...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#C62828]">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[15px] text-[#77706D]">No products found.</div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {paginatedProducts.map(p => {
                  const isSelected = p.id === selectedProductId;
                  const isOutOfStock = p.status === "OUT_OF_STOCK" || p.currentStock <= 0;
                  
                  return (
                    <button
                      key={p.id}
                      onClick={() => !isOutOfStock && onSelect(p.id)}
                      disabled={isOutOfStock}
                      className={`w-full flex items-center justify-between min-h-[76px] px-[16px] py-[12px] rounded-[8px] transition-colors text-left
                        ${isSelected ? 'bg-[#7A1830]/5 border border-[#7A1830]/20' : 'hover:bg-[#F5EFE6] border border-transparent'}
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-[#FDFCF9] hover:bg-[#FDFCF9]' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-[16px]">
                        {p.image ? (
                          <img src={p.image} className="w-[44px] h-[44px] rounded-[6px] object-cover border border-[#EAE5E0]" />
                        ) : (
                          <div className="w-[44px] h-[44px] rounded-[6px] bg-[#FCFCFB] border border-[#EAE5E0] flex items-center justify-center text-[16px] font-bold text-[#7A1830]">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className={`text-[15px] font-medium ${isSelected ? 'text-[#7A1830]' : 'text-[#242124]'}`}>
                            {p.name}
                          </span>
                          <span className="text-[13px] text-[#77706D]">{p.sku}</span>
                          {isOutOfStock && (
                            <span className="text-[12px] text-[#C62828] mt-[2px] font-medium">Out of stock</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-[4px]">
                        <span className="text-[15px] font-semibold text-[#242124]">
                          {formatCurrency(p.sellingPrice)}
                        </span>
                        {!isOutOfStock ? (
                          <span className={`px-[8px] py-[2px] rounded-full text-[12px] font-medium ${p.currentStock <= p.lowStockThreshold ? 'bg-[#D97706]/10 text-[#D97706]' : 'bg-[#059669]/10 text-[#059669]'}`}>
                            Stock: {p.currentStock}
                          </span>
                        ) : (
                          <span className="px-[8px] py-[2px] rounded-full text-[12px] font-medium bg-[#DC2626]/10 text-[#DC2626]">
                            0 Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="p-[20px] border-t border-[#EAE5E0] flex items-center justify-between bg-[#FCFCFB] rounded-b-[16px]">
            <span className="text-[14px] text-[#77706D]">
              Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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
