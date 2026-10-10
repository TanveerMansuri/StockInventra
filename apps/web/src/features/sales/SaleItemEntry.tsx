import { ChevronDown, Plus, Package } from "lucide-react";
import { Product, Category } from "@stock-inventra/types";
import { PendingSaleItem } from "./types";
import { useState, useEffect } from "react";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { useSettings } from "../../hooks/useSettings";

interface SaleItemEntryProps {
  categories: Category[];
  products: Product[];
  categoryId: string;
  selectedProductId: string;
  onProductIdChange: (id: string) => void;
  onOpenCategoryModal: () => void;
  onOpenProductModal: () => void;
  onAddItem: (item: Omit<PendingSaleItem, 'id'>) => void;
  error: string | null;
  saleItems: PendingSaleItem[];
}

export function SaleItemEntry({
  categories,
  products,
  categoryId,
  selectedProductId,
  onProductIdChange,
  onOpenCategoryModal,
  onOpenProductModal,
  onAddItem,
  error,
  saleItems
}: SaleItemEntryProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const formatCurrency = useCurrencyFormatter();
  const { data: settings } = useSettings();
  const currencySymbol = settings?.currency?.currency || 'USD';

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const category = categories.find(c => c.id === categoryId);
  const product = products.find(p => p.id === selectedProductId);

  const currentSubtotal = (product?.sellingPrice || 0) * quantity;
  let currentCalculatedDiscount = 0;
  if (discountType === 'percentage') {
    currentCalculatedDiscount = (currentSubtotal * discountValue) / 100;
  } else {
    currentCalculatedDiscount = discountValue;
  }
  
  if (currentCalculatedDiscount > currentSubtotal) {
    currentCalculatedDiscount = currentSubtotal;
  }

  const currentTaxable = currentSubtotal - currentCalculatedDiscount;
  const currentTaxAmount = (currentTaxable * (product?.taxPercent || 0)) / 100;
  const currentFinalAmount = currentTaxable + currentTaxAmount;

  const handleAdd = () => {
    if (!product) return;
    
    const existingQuantity = saleItems.filter(item => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
    if (quantity + existingQuantity > product.currentStock) {
      setLocalError(`Cannot add ${quantity}. Only ${product.currentStock - existingQuantity} remaining.`);
      return;
    }
    
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      setLocalError("Percentage discount must be between 0 and 100.");
      return;
    }

    setLocalError(null);
    onAddItem({
      product,
      quantity,
      discountType,
      discountValue,
      calculatedDiscount: currentCalculatedDiscount,
      subtotal: currentSubtotal,
      taxAmount: currentTaxAmount,
      finalAmount: currentFinalAmount,
      totalCost: product.purchasePrice * quantity
    });

    onProductIdChange("");
    setQuantity(1);
    setDiscountValue(0);
    setDiscountType('percentage');
  };

  return (
    <div className="flex flex-col gap-[12px] flex-shrink-0">
      {localError && (
        <div className="p-[8px] rounded-[6px] bg-[#C62828]/10 border border-[#C62828]/20 text-[#C62828] text-[12px] font-medium">
          {localError}
        </div>
      )}

      {/* Category and Product Selectors */}
      <div className="flex gap-[10px]">
        <div className="w-[40%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px]">
            Select Category <span className="text-[#C62828]">*</span>
          </label>
          <button
            type="button"
            onClick={onOpenCategoryModal}
            className="w-full h-[42px] px-[12px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] text-left flex items-center justify-between focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/30 transition-all outline-none"
          >
            <div className="flex items-center gap-[6px] truncate">
              <Package size={14} className="text-[#77706D] shrink-0" />
              <span className={`text-[14px] truncate ${category ? 'text-[#242124]' : 'text-[#77706D]'}`}>
                {category ? category.name : 'Choose...'}
              </span>
            </div>
            <ChevronDown size={16} className="text-[#77706D] shrink-0 ml-[4px]" />
          </button>
        </div>

        <div className="w-[60%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px]">
            Select Product <span className="text-[#C62828]">*</span>
          </label>
          <button
            type="button"
            onClick={onOpenProductModal}
            disabled={!categoryId}
            className="w-full h-[42px] px-[12px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] text-left flex items-center justify-between focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/30 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#FCFCFB]"
          >
            {product ? (
              <div className="flex items-center gap-[6px] truncate">
                {product.image ? (
                  <img src={product.image} className="w-[20px] h-[20px] rounded-[4px] object-cover shrink-0" />
                ) : (
                  <div className="w-[20px] h-[20px] rounded-[4px] bg-[#F5EFE6] flex items-center justify-center text-[11px] font-bold text-[#7A1830] shrink-0">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col truncate">
                  <span className="text-[13px] text-[#242124] truncate leading-tight font-medium">{product.name}</span>
                  <span className="text-[11px] text-[#77706D] truncate leading-tight">SKU: {product.sku} | Stock: {product.currentStock} units</span>
                </div>
              </div>
            ) : (
              <span className="text-[14px] text-[#77706D] truncate">
                {!categoryId ? 'Choose category first' : 'Choose product...'}
              </span>
            )}
            <ChevronDown size={16} className="text-[#77706D] shrink-0 ml-[4px]" />
          </button>
        </div>
      </div>

      {/* Inputs Row */}
      <div className="flex gap-[10px] items-start">
        <div className="w-[20%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px]">
            Quantity <span className="text-[#C62828]">*</span>
          </label>
          <input 
            type="number"
            min="1"
            max={product?.currentStock || 1}
            value={quantity || ''}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full h-[40px] px-[10px] border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] text-[14px] text-[#242124] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/30 transition-all disabled:opacity-50"
            disabled={!product}
          />
          {product && (
            <div className="text-[11px] text-[#77706D] mt-[4px]">
              Available stock: {product.currentStock}
            </div>
          )}
        </div>
        <div className="w-[24%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px] truncate">
            Selling Price ({currencySymbol})
          </label>
          <input 
            type="number"
            value={product?.sellingPrice || 0}
            disabled
            className="w-full h-[40px] px-[10px] border border-[#EAE5E0] rounded-[8px] bg-[#FCFCFB] text-[#77706D] text-[14px] outline-none"
          />
        </div>
        <div className="w-[32%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px]">
            Discount Type
          </label>
          <div className="flex items-center gap-[10px] h-[40px]">
            <label className="flex items-center gap-[4px] cursor-pointer">
              <input 
                type="radio" 
                name="discountType" 
                className="hidden" 
                checked={discountType === 'percentage'} 
                onChange={() => { setDiscountType('percentage'); setDiscountValue(0); }} 
              />
              <div className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center transition-colors ${discountType === 'percentage' ? 'border-[#7A1830]' : 'border-[#EAE5E0]'}`}>
                {discountType === 'percentage' && <div className="w-[8px] h-[8px] rounded-full bg-[#7A1830]" />}
              </div>
              <span className="text-[13px] font-medium text-[#242124]">%</span>
            </label>
            <label className="flex items-center gap-[4px] cursor-pointer">
              <input 
                type="radio" 
                name="discountType" 
                className="hidden" 
                checked={discountType === 'fixed'} 
                onChange={() => { setDiscountType('fixed'); setDiscountValue(0); }} 
              />
              <div className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center transition-colors ${discountType === 'fixed' ? 'border-[#7A1830]' : 'border-[#EAE5E0]'}`}>
                {discountType === 'fixed' && <div className="w-[8px] h-[8px] rounded-full bg-[#7A1830]" />}
              </div>
              <span className="text-[13px] font-medium text-[#242124]">{currencySymbol}</span>
            </label>
          </div>
        </div>
        <div className="w-[24%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px] truncate">
            Discount ({discountType === 'percentage' ? '%' : currencySymbol})
          </label>
          <input 
            type="number"
            min="0"
            max={discountType === 'percentage' ? 100 : currentSubtotal}
            value={discountValue || ''}
            onChange={(e) => {
              let val = Math.max(0, Number(e.target.value));
              if (discountType === 'percentage') {
                val = Math.min(100, val);
              } else {
                val = Math.min(currentSubtotal, val);
              }
              setDiscountValue(val);
            }}
            placeholder="0"
            disabled={!product}
            className="w-full h-[40px] px-[10px] border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] text-[14px] text-[#242124] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/30 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Preview & Add Action */}
      <div className="bg-[#F5EFE6] rounded-[8px] p-[12px] flex items-center justify-between gap-[16px] mt-[2px] h-[72px]">
        <div className="flex items-center gap-[24px]">
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-[#242124] leading-tight">
              {formatCurrency(currentSubtotal)}
            </span>
            <span className="text-[11px] text-[#77706D] mt-[2px]">Subtotal</span>
          </div>
          <div className="w-[1px] h-[32px] bg-[#EAE5E0]" />
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-[#C62828] leading-tight">
              - {formatCurrency(currentCalculatedDiscount)}
            </span>
            <span className="text-[11px] text-[#77706D] mt-[2px]">Discount ({discountType === 'percentage' ? `${discountValue}%` : `${currencySymbol}Fixed`})</span>
          </div>
          <div className="w-[1px] h-[32px] bg-[#EAE5E0]" />
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-[#7A1830] leading-tight">
              {formatCurrency(currentFinalAmount)}
            </span>
            <span className="text-[11px] text-[#77706D] mt-[2px]">Final Price</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product || quantity > product.currentStock}
          className="h-[48px] px-[20px] bg-[#7A1830] hover:bg-[#641326] text-[#FFFFFF] font-semibold text-[14px] rounded-[8px] transition-colors flex items-center justify-center gap-[6px] focus:outline-none focus:ring-2 focus:ring-[#7A1830]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus size={16} />
          Add to Sale
        </button>
      </div>
    </div>
  );
}
