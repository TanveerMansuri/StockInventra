import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { salesService } from "../../services/api";
import { Receipt } from "lucide-react";
import { CategorySelectionModal } from "./CategorySelectionModal";
import { ProductSelectionModal } from "./ProductSelectionModal";
import { SaleItemEntry } from "./SaleItemEntry";
import { SaleItemsTable } from "./SaleItemsTable";
import { SaleSummary } from "./SaleSummary";
import { PendingSaleItem } from "./types";

export function NewSalePage() {
  const navigate = useNavigate();
  
  const [categoryId, setCategoryId] = useState<string>("");
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories({ limit: 100, status: "ACTIVE" });
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts({ limit: 100, categoryId: categoryId || undefined });
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [saleItems, setSaleItems] = useState<PendingSaleItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Reset product selection if category changes
  useEffect(() => {
    if (selectedProductId) {
      const productStillValid = products.find(p => p.id === selectedProductId && p.categoryId === categoryId);
      if (!productStillValid && categoryId) {
        setSelectedProductId("");
      }
    }
  }, [categoryId, products, selectedProductId]);

  const handleAddItem = (newItem: Omit<PendingSaleItem, 'id'>) => {
    const item: PendingSaleItem = {
      ...newItem,
      id: Math.random().toString(36).substring(2, 9),
    };
    setSaleItems([...saleItems, item]);
  };

  const handleRemoveItem = (id: string) => {
    setSaleItems(saleItems.filter(item => item.id !== id));
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) return;

    setError(null);
    setIsSubmitting(true);
    
    try {
      const itemsPayload = saleItems.map(item => {
        const discountPercent = item.subtotal > 0 ? (item.calculatedDiscount / item.subtotal) * 100 : 0;
        return {
          productId: item.product.id,
          quantity: item.quantity,
          discount: discountPercent
        };
      });

      const res = await salesService.createSale({ items: itemsPayload });
      
      if (res.success) {
        navigate("/sales");
      } else {
        setError(res.message || "Failed to create sale");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#FCFCFB] px-[16px] pt-[16px] pb-[16px] h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="max-w-[1080px] w-full mx-auto flex flex-col h-full min-h-0">
        <div className="mb-[16px] flex-shrink-0">
          <h1 className="text-[32px] font-bold text-[#242124] leading-[38px]">New Sale</h1>
          <p className="text-[14px] leading-[20px] text-[#77706D] mt-[2px]">Create a new sale and update inventory.</p>
        </div>

        {error && (
          <div className="mb-[12px] p-[12px] rounded-[8px] bg-[#C62828]/10 border border-[#C62828]/20 text-[#C62828] text-[13px] font-medium flex-shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSale} className="flex flex-col flex-1 min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.27fr)_minmax(0,1fr)] gap-[16px] items-stretch flex-1 min-h-0 mb-[16px]">
            
            {/* Left Billing Form */}
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] shadow-sm flex flex-col p-[16px] gap-[16px] h-full min-w-0 min-h-0">
              <SaleItemEntry 
                categories={categories}
                products={products}
                categoryId={categoryId}
                selectedProductId={selectedProductId}
                onProductIdChange={setSelectedProductId}
                onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
                onOpenProductModal={() => setIsProductModalOpen(true)}
                onAddItem={handleAddItem}
                error={null}
                saleItems={saleItems}
              />

              <div className="h-[1px] bg-[#EAE5E0] w-full flex-shrink-0" />

              <SaleItemsTable 
                items={saleItems}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Right Sale Summary */}
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] shadow-sm flex flex-col h-full min-w-0 min-h-0">
              <SaleSummary saleItems={saleItems} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || saleItems.length === 0}
            className="w-full h-[48px] bg-[#7A1830] hover:bg-[#641326] text-[#FFFFFF] font-semibold text-[15px] rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830]/50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center gap-[8px]"
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <Receipt size={18} />
                Complete Sale
              </>
            )}
          </button>
        </form>
      </div>

      <CategorySelectionModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        selectedCategoryId={categoryId}
        onSelect={setCategoryId}
        isLoading={isLoadingCategories}
        error={categoriesError}
      />

      <ProductSelectionModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        products={products}
        selectedProductId={selectedProductId}
        onSelect={setSelectedProductId}
        isLoading={isLoadingProducts}
        error={productsError}
        categoryName={categories.find(c => c.id === categoryId)?.name}
      />
    </div>
  );
}
