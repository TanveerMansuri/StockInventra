import { Trash2 } from "lucide-react";
import { PendingSaleItem } from "./types";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { useSettings } from "../../hooks/useSettings";
import { ProductAvatar } from "../../components/common/ProductAvatar";
import { UNIT_SHORT_LABELS, formatQuantityWithUnit } from "@stock-inventra/types";

interface SaleItemsTableProps {
  items: PendingSaleItem[];
  onRemoveItem: (id: string) => void;
}

export function SaleItemsTable({ items, onRemoveItem }: SaleItemsTableProps) {
  const formatCurrency = useCurrencyFormatter();
  const { data: settings } = useSettings();
  const currencySymbol = settings?.currency?.currency || 'USD';
  const hasTax = items.some(item => (item.taxAmount || 0) > 0 || (item.taxRate || 0) > 0);

  return (
    <div className="flex-1 flex flex-col min-h-[150px] overflow-hidden">
      <div className="flex items-center justify-between mb-[8px] flex-shrink-0">
        <h3 className="text-[16px] font-semibold text-[#242124]">
          Sale Items {items.length > 0 && `(${items.length})`}
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => items.forEach(item => onRemoveItem(item.id))}
            className="h-[28px] px-[10px] rounded-[6px] border border-[#EAE5E0] bg-[#FFFFFF] text-[#C62828] text-[12px] font-medium hover:bg-[#C62828]/5 transition-colors flex items-center gap-[4px]"
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] flex flex-col min-h-[150px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-[#77706D] text-[13px] h-[150px]">
            <span className="font-medium text-[#242124]">No items added yet</span>
            <span className="mt-[4px] text-[12px]">Select a category and product above to begin a sale.</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead className="sticky top-0 bg-[#FCFCFB] z-10">
                <tr>
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider">Product</th>
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider text-center">Qty</th>
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider">Subtotal</th>
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider">Discount</th>
                  {hasTax && (
                    <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider">Tax</th>
                  )}
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider">Total</th>
                  <th className="h-[40px] px-[10px] border-b border-[#EAE5E0] text-[11px] font-semibold text-[#77706D] tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const unitShort = UNIT_SHORT_LABELS[item.product.unit] || item.product.unit || 'pcs';
                  return (
                    <tr key={item.id} className={`hover:bg-[#FAF6F2] transition-colors ${index !== items.length - 1 ? 'border-b border-[#F0EBE6]' : ''}`}>
                      <td className="px-[10px] py-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <ProductAvatar name={item.product.name} image={item.product.image} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-[#242124] line-clamp-1 leading-tight">{item.product.name}</span>
                            <span className="text-[11px] text-[#77706D] leading-tight">
                              {formatCurrency(item.product.sellingPrice)}/{unitShort}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[10px] py-[8px]">
                        <div className="flex items-center justify-center">
                          <span className="px-[8px] h-[30px] flex items-center justify-center bg-[#FCFCFB] border border-[#EAE5E0] rounded-[6px] text-[12px] font-medium text-[#242124] whitespace-nowrap">
                            {formatQuantityWithUnit(item.quantity, item.product.unit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-[10px] py-[8px] text-[13px] text-[#242124]">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-[10px] py-[8px]">
                        <div className="flex flex-col">
                          {item.calculatedDiscount > 0 ? (
                            <>
                              <span className="text-[12px] font-medium text-[#C62828] leading-tight">
                                -{formatCurrency(item.calculatedDiscount)}
                              </span>
                              <span className="text-[11px] text-[#77706D] leading-tight">
                                ({item.discountType === 'percentage' ? `${item.discountValue}%` : `${currencySymbol}${item.discountValue}`})
                              </span>
                            </>
                          ) : (
                            <span className="text-[12px] text-[#77706D]">0%</span>
                          )}
                        </div>
                      </td>
                      {hasTax && (
                        <td className="px-[10px] py-[8px]">
                          <div className="flex flex-col">
                            {item.taxAmount > 0 ? (
                              <>
                                <span className="text-[12px] font-medium text-[#242124] leading-tight">
                                  +{formatCurrency(item.taxAmount)}
                                </span>
                                <span className="text-[11px] text-[#77706D] leading-tight">
                                  ({item.taxRate}%)
                                </span>
                              </>
                            ) : (
                              <span className="text-[12px] text-[#77706D]">0%</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-[10px] py-[8px] text-[13px] font-semibold text-[#242124]">
                        {formatCurrency(item.finalAmount)}
                      </td>
                      <td className="px-[10px] py-[8px]">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="w-[28px] h-[28px] mx-auto flex items-center justify-center rounded-[6px] text-[#C62828] hover:bg-[#C62828]/10 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
