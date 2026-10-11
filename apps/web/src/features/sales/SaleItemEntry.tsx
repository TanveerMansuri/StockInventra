import { ChevronDown, Plus, Package } from "lucide-react";
import { Product, Category, UNIT_SHORT_LABELS, formatQuantityWithUnit } from "@stock-inventra/types";
import { PendingSaleItem } from "./types";
import { useState, useEffect } from "react";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { useSettings } from "../../hooks/useSettings";
import { ProductAvatar } from "../../components/common/ProductAvatar";

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

  const category = categories.find(c => c.id === categoryId);
  const product = products.find(p => p.id === selectedProductId);

  // When a product is selected, pre-populate default discount from settings or product
  useEffect(() => {
    if (product) {
      const defaultDisc = product.discountPercent || settings?.inventory?.defaultDiscount || 0;
      setDiscountType('percentage');
      setDiscountValue(defaultDisc);
      setQuantity(1);
    }
  }, [product?.id, settings?.inventory?.defaultDiscount]);

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const unitShort = product ? (UNIT_SHORT_LABELS[product.unit] || product.unit || 'pcs') : '';
  const currentSubtotal = Math.round(((product?.sellingPrice || 0) * (quantity || 0)) * 100) / 100;
  
  let currentCalculatedDiscount = 0;
  if (discountType === 'percentage') {
    currentCalculatedDiscount = Math.round((currentSubtotal * (discountValue || 0) / 100) * 100) / 100;
  } else {
    currentCalculatedDiscount = discountValue || 0;
  }
  
  if (currentCalculatedDiscount > currentSubtotal) {
    currentCalculatedDiscount = currentSubtotal;
  }

  const configuredTaxRate = settings?.currency?.taxRate ?? product?.taxPercent ?? 0;
  const currentTaxable = Math.round((currentSubtotal - currentCalculatedDiscount) * 100) / 100;
  const currentTaxAmount = Math.round((currentTaxable * (configuredTaxRate / 100)) * 100) / 100;
  const currentFinalAmount = Math.round((currentTaxable + currentTaxAmount) * 100) / 100;

  const handleAdd = () => {
    if (!product) return;
    
    if (!quantity || quantity <= 0) {
      setLocalError("Quantity must be greater than 0.");
      return;
    }

    const existingQuantity = saleItems.filter(item => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
    const availableStock = Math.round((product.currentStock - existingQuantity) * 1000) / 1000;
    if (quantity > availableStock) {
      setLocalError(`Cannot add ${formatQuantityWithUnit(quantity, product.unit)}. Only ${formatQuantityWithUnit(availableStock, product.unit)} remaining.`);
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
      taxRate: configuredTaxRate,
      taxAmount: currentTaxAmount,
      finalAmount: currentFinalAmount,
      totalCost: Math.round((product.purchasePrice * quantity) * 100) / 100
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
                <ProductAvatar name={product.name} image={product.image} size="xs" />
                <div className="flex flex-col truncate">
                  <span className="text-[13px] text-[#242124] truncate leading-tight font-medium">{product.name}</span>
                  <span className="text-[11px] text-[#77706D] truncate leading-tight">SKU: {product.sku} | Stock: {formatQuantityWithUnit(product.currentStock, product.unit)}</span>
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
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px] truncate">
            Quantity {unitShort && `(${unitShort})`} <span className="text-[#C62828]">*</span>
          </label>
          <input 
            type="number"
            step="any"
            min="0.001"
            max={product?.currentStock || 1}
            value={quantity === 0 && !quantity.toString().match(/^0$/) ? '' : quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? ('' as any) : Number(e.target.value))}
            className="w-full h-[40px] px-[10px] border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] text-[14px] text-[#242124] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/30 transition-all disabled:opacity-50"
            disabled={!product}
            placeholder="1"
          />
          {product && (
            <div className="text-[11px] text-[#77706D] mt-[4px] truncate">
              Stock: {formatQuantityWithUnit(product.currentStock, product.unit)}
            </div>
          )}
        </div>
        <div className="w-[24%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px] truncate">
            Unit Price {unitShort ? `(/${unitShort})` : ''}
          </label>
          <input 
            type="text"
            value={product ? `${formatCurrency(product.sellingPrice)}${unitShort ? `/${unitShort}` : ''}` : ''}
            disabled
            className="w-full h-[40px] px-[10px] border border-[#EAE5E0] rounded-[8px] bg-[#FCFCFB] text-[#77706D] text-[14px] outline-none font-medium"
          />
        </div>
        <div className="w-[30%]">
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
        <div className="w-[26%]">
          <label className="block text-[13px] font-medium text-[#242124] mb-[5px] truncate">
            Discount ({discountType === 'percentage' ? '%' : currencySymbol})
          </label>
          <input 
            type="number"
            step="any"
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
      <div className="bg-[#F5EFE6] rounded-[8px] p-[12px] flex items-center justify-between gap-[16px] mt-[2px] min-h-[72px]">
        <div className="flex items-center gap-[18px] flex-wrap">
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
          {configuredTaxRate > 0 && (
            <>
              <div className="w-[1px] h-[32px] bg-[#EAE5E0]" />
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-[#242124] leading-tight">
                  + {formatCurrency(currentTaxAmount)}
                </span>
                <span className="text-[11px] text-[#77706D] mt-[2px]">Tax ({configuredTaxRate}%)</span>
              </div>
            </>
          )}
          <div className="w-[1px] h-[32px] bg-[#EAE5E0]" />
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-[#7A1830] leading-tight">
              {formatCurrency(currentFinalAmount)}
            </span>
            <span className="text-[11px] text-[#77706D] mt-[2px]">Item Total</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product || !quantity || quantity <= 0}
          className="h-[48px] px-[20px] bg-[#7A1830] hover:bg-[#641326] text-[#FFFFFF] font-semibold text-[14px] rounded-[8px] transition-colors flex items-center justify-center gap-[6px] focus:outline-none focus:ring-2 focus:ring-[#7A1830]/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus size={16} />
          Add to Sale
        </button>
      </div>
    </div>
  );
}
