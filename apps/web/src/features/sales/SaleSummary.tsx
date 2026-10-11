import { PendingSaleItem } from "./types";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { useSettings } from "../../hooks/useSettings";
import { ProductAvatar } from "../../components/common/ProductAvatar";
import { RotateCcw } from "lucide-react";

export interface SaleCalculationDetails {
  billSubtotal: number;
  defaultDiscountTotal: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  priceBeforeAdditionalDiscount: number;
  additionalDiscountTotal: number;
  amountBeforeAdjustment: number;
  adjustment: number;
  finalPayable: number;
  billTotalCost: number;
  billGrossProfit: number;
  billProfitMargin: number;
}

interface SaleSummaryProps {
  saleItems: PendingSaleItem[];
  enableTax: boolean;
  onToggleTax: (enabled: boolean) => void;
  additionalDiscountType: 'percentage' | 'fixed';
  onAdditionalDiscountTypeChange: (type: 'percentage' | 'fixed') => void;
  additionalDiscountValue: number;
  onAdditionalDiscountValueChange: (val: number) => void;
  isRoundingEnabled: boolean;
  onToggleRounding: (enabled: boolean) => void;
  targetFinalAmount: string;
  onTargetFinalAmountChange: (val: string) => void;
  calculation: SaleCalculationDetails;
}

export function SaleSummary({
  saleItems,
  enableTax,
  onToggleTax,
  additionalDiscountType,
  onAdditionalDiscountTypeChange,
  additionalDiscountValue,
  onAdditionalDiscountValueChange,
  isRoundingEnabled,
  onToggleRounding,
  targetFinalAmount,
  onTargetFinalAmountChange,
  calculation,
}: SaleSummaryProps) {
  const formatCurrency = useCurrencyFormatter();
  const { data: settings } = useSettings();
  const currencySymbol = settings?.currency?.currency || 'USD';
  const configuredTaxRate = settings?.currency?.taxRate ?? 0;

  const totalQuantity = Math.round(saleItems.reduce((sum, item) => sum + item.quantity, 0) * 1000) / 1000;

  // Recent items (last 5 added)
  const recentItems = [...saleItems].reverse().slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-[14px] border-b border-[#EAE5E0] flex-shrink-0 flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-[#242124]">Sale Summary</h3>
        <span className="text-[12px] font-medium text-[#77706D]">{saleItems.length} items</span>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-[16px] flex flex-col gap-[9px]">
          
          {/* Quick Metrics */}
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Total Items</span>
            <span className="text-[#242124] font-semibold">{saleItems.length}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Total Quantity</span>
            <span className="text-[#242124] font-semibold">{totalQuantity}</span>
          </div>
          
          <div className="my-[2px] h-[1px] bg-[#EAE5E0]" />

          {/* Subtotal */}
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#77706D]">Subtotal (before discounts)</span>
            <span className="text-[#242124] font-semibold">{formatCurrency(calculation.billSubtotal)}</span>
          </div>

          {/* Default Pre-Tax Discount */}
          {calculation.defaultDiscountTotal > 0 && (
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#77706D]">Default Item Discount</span>
              <span className="text-[#C62828] font-semibold">- {formatCurrency(calculation.defaultDiscountTotal)}</span>
            </div>
          )}

          {/* Taxable Amount */}
          {(calculation.defaultDiscountTotal > 0 || (configuredTaxRate > 0 && enableTax)) && (
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[#77706D]">Taxable Amount</span>
              <span className="text-[#242124] font-medium">{formatCurrency(calculation.taxableAmount)}</span>
            </div>
          )}

          {/* Optional Tax Row */}
          {configuredTaxRate > 0 ? (
            <div className="flex justify-between items-center text-[14px]">
              <label className="flex items-center gap-[6px] cursor-pointer text-[#77706D]">
                <input 
                  type="checkbox" 
                  checked={enableTax} 
                  onChange={(e) => onToggleTax(e.target.checked)}
                  className="rounded-[4px] border-[#EAE5E0] text-[#7A1830] focus:ring-[#7A1830]"
                />
                <span>Apply Tax ({configuredTaxRate}%)</span>
              </label>
              <span className="text-[#242124] font-semibold">
                {enableTax ? `+ ${formatCurrency(calculation.taxAmount)}` : formatCurrency(0)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-[13px] text-[#77706D]">
              <span>Tax</span>
              <span>Disabled (0%)</span>
            </div>
          )}

          <div className="my-[2px] h-[1px] bg-[#EAE5E0]" />

          {/* Additional Customer Discount Input */}
          <div className="bg-[#FAF6F2] rounded-[8px] p-[10px] flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#242124]">Additional Customer Discount</span>
              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => onAdditionalDiscountTypeChange('percentage')}
                  className={`px-[6px] py-[2px] rounded text-[11px] font-semibold transition-colors ${
                    additionalDiscountType === 'percentage' 
                      ? 'bg-[#7A1830] text-white' 
                      : 'bg-[#FFFFFF] border border-[#EAE5E0] text-[#77706D]'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => onAdditionalDiscountTypeChange('fixed')}
                  className={`px-[6px] py-[2px] rounded text-[11px] font-semibold transition-colors ${
                    additionalDiscountType === 'fixed' 
                      ? 'bg-[#7A1830] text-white' 
                      : 'bg-[#FFFFFF] border border-[#EAE5E0] text-[#77706D]'
                  }`}
                >
                  {currencySymbol}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <input
                type="number"
                step="any"
                min="0"
                max={additionalDiscountType === 'percentage' ? 100 : calculation.priceBeforeAdditionalDiscount}
                value={additionalDiscountValue || ''}
                onChange={(e) => onAdditionalDiscountValueChange(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="flex-1 h-[34px] px-[10px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[6px] text-[13px] text-[#242124] outline-none focus:border-[#7A1830]"
              />
              <span className="text-[13px] font-semibold text-[#C62828] whitespace-nowrap min-w-[70px] text-right">
                - {formatCurrency(calculation.additionalDiscountTotal)}
              </span>
            </div>
          </div>

          {/* Price Before Final Adjustment */}
          <div className="flex justify-between items-center text-[13px] pt-[2px]">
            <span className="text-[#77706D]">Amount before adjustment</span>
            <span className="text-[#242124] font-medium">{formatCurrency(calculation.amountBeforeAdjustment)}</span>
          </div>

          {/* Round Figure Toggle & Negotiated Final Adjustment */}
          <div className="bg-[#FAF6F2] rounded-[8px] p-[10px] flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-[6px] cursor-pointer text-[12px] font-medium text-[#242124]">
                <input 
                  type="checkbox" 
                  checked={isRoundingEnabled && !targetFinalAmount} 
                  disabled={!!targetFinalAmount}
                  onChange={(e) => onToggleRounding(e.target.checked)}
                  className="rounded-[4px] border-[#EAE5E0] text-[#7A1830] focus:ring-[#7A1830]"
                />
                <span>Round Figure (to nearest {currencySymbol})</span>
              </label>

              {calculation.adjustment !== 0 && (
                <span className={`text-[12px] font-semibold ${calculation.adjustment > 0 ? 'text-[#16834A]' : 'text-[#C62828]'}`}>
                  {calculation.adjustment > 0 ? `+ ${formatCurrency(calculation.adjustment)}` : `- ${formatCurrency(Math.abs(calculation.adjustment))}`}
                </span>
              )}
            </div>

            {/* Target Final Bill negotiation */}
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] text-[#77706D] whitespace-nowrap">Target Bill:</span>
              <input
                type="number"
                step="any"
                min="0"
                value={targetFinalAmount}
                onChange={(e) => onTargetFinalAmountChange(e.target.value)}
                placeholder={formatCurrency(calculation.amountBeforeAdjustment)}
                className="flex-1 h-[32px] px-[8px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[6px] text-[12px] text-[#242124] outline-none focus:border-[#7A1830]"
              />
              {targetFinalAmount && (
                <button
                  type="button"
                  onClick={() => onTargetFinalAmountChange('')}
                  title="Reset target amount"
                  className="p-[6px] rounded-[6px] border border-[#EAE5E0] bg-[#FFFFFF] text-[#77706D] hover:text-[#242124] transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
            {targetFinalAmount && calculation.adjustment !== 0 && (
              <div className="text-[11px] text-[#77706D] flex justify-between">
                <span>Negotiated adjustment:</span>
                <span className={calculation.adjustment < 0 ? 'text-[#C62828] font-medium' : 'text-[#16834A] font-medium'}>
                  {calculation.adjustment < 0 ? `- ${formatCurrency(Math.abs(calculation.adjustment))}` : `+ ${formatCurrency(calculation.adjustment)}`}
                </span>
              </div>
            )}
          </div>
          
          {/* Final Sale Amount Banner */}
          <div className="mt-[4px] mb-[2px]">
            <div className="bg-[#F5EFE6] rounded-[8px] px-[16px] py-[12px] flex justify-between items-center border border-[#EAE5E0]">
              <span className="text-[15px] font-bold text-[#7A1830]">Final Payable</span>
              <span className="text-[20px] font-extrabold text-[#7A1830]">
                {formatCurrency(calculation.finalPayable)}
              </span>
            </div>
          </div>
          
          <div className="my-[2px] h-[1px] bg-[#EAE5E0]" />
          
          {/* Cost and Gross Profit */}
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Total Cost</span>
            <span className="text-[#242124] font-medium">{formatCurrency(calculation.billTotalCost)}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Gross Profit</span>
            <span className={`font-semibold ${calculation.billGrossProfit >= 0 ? 'text-[#16834A]' : 'text-[#C62828]'}`}>
              {calculation.billGrossProfit >= 0 ? '+' : ''}{formatCurrency(calculation.billGrossProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Profit Margin</span>
            <span className={`font-semibold ${calculation.billGrossProfit >= 0 ? 'text-[#16834A]' : 'text-[#C62828]'}`}>
              {calculation.billProfitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Recent Items Section */}
        {recentItems.length > 0 && (
          <div className="mt-auto flex flex-col p-[16px] pt-[0]">
            <h4 className="text-[13px] font-semibold text-[#242124] mb-[8px]">Recent Items (This Sale)</h4>
            <div className="flex flex-col gap-[6px]">
              {recentItems.map(item => (
                <div key={`recent-${item.id}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <ProductAvatar name={item.product.name} image={item.product.image} size="sm" />
                    <span className="text-[12px] font-medium text-[#242124] line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="text-[12px] text-[#77706D] whitespace-nowrap">
                    {item.quantity} {item.product.unit || 'pcs'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
