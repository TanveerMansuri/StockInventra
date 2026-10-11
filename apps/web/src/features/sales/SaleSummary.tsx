import { PendingSaleItem } from "./types";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { ProductAvatar } from "../../components/common/ProductAvatar";

interface SaleSummaryProps {
  saleItems: PendingSaleItem[];
}

export function SaleSummary({ saleItems }: SaleSummaryProps) {
  const formatCurrency = useCurrencyFormatter();
  const totalQuantity = saleItems.reduce((sum, item) => sum + item.quantity, 0);
  const billSubtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const billDiscount = saleItems.reduce((sum, item) => sum + item.calculatedDiscount, 0);
  const billTax = saleItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const billFinalAmount = saleItems.reduce((sum, item) => sum + item.finalAmount, 0);
  const billTotalCost = saleItems.reduce((sum, item) => sum + item.totalCost, 0);
  const billGrossProfit = billFinalAmount - billTotalCost;
  const billProfitMargin = billFinalAmount > 0 ? (billGrossProfit / billFinalAmount) * 100 : 0;

  // Recent items (last 5 added)
  const recentItems = [...saleItems].reverse().slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-[14px] border-b border-[#EAE5E0] flex-shrink-0">
        <h3 className="text-[17px] font-semibold text-[#242124]">Sale Summary</h3>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-[16px] flex flex-col gap-[9px]">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Items</span>
            <span className="text-[#242124] font-semibold">{saleItems.length}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Total Quantity</span>
            <span className="text-[#242124] font-semibold">{totalQuantity}</span>
          </div>
          
          <div className="mt-[4px] mb-[4px] h-[1px] bg-[#EAE5E0]" />

          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#77706D]">Subtotal</span>
            <span className="text-[#242124] font-semibold">{formatCurrency(billSubtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#77706D]">Total Discount</span>
            <span className="text-[#C62828] font-semibold">- {formatCurrency(billDiscount)}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#77706D]">Tax (18%)</span>
            <span className="text-[#242124] font-semibold">{formatCurrency(billTax)}</span>
          </div>
          
          <div className="mt-[6px] mb-[2px]">
            <div className="bg-[#F5EFE6] rounded-[8px] px-[16px] py-[12px] flex justify-between items-center">
              <span className="text-[15px] font-bold text-[#7A1830]">Final Sale Amount</span>
              <span className="text-[18px] font-bold text-[#7A1830]">
                {formatCurrency(billFinalAmount)}
              </span>
            </div>
          </div>
          
          <div className="mt-[2px] mb-[2px] h-[1px] bg-[#EAE5E0]" />
          
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Total Cost</span>
            <span className="text-[#242124] font-semibold">{formatCurrency(billTotalCost)}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Gross Profit</span>
            <span className={`font-semibold ${billGrossProfit >= 0 ? 'text-[#16834A]' : 'text-[#C62828]'}`}>
              {billGrossProfit >= 0 ? '+' : ''}{formatCurrency(billGrossProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#77706D]">Profit Margin</span>
            <span className={`font-semibold ${billGrossProfit >= 0 ? 'text-[#16834A]' : 'text-[#C62828]'}`}>
              {billProfitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Recent Items Section */}
        {recentItems.length > 0 && (
          <div className="mt-auto flex flex-col p-[16px] pt-[0]">
            <h4 className="text-[13px] font-semibold text-[#242124] mb-[10px]">Recent Items (This Sale)</h4>
            <div className="flex flex-col gap-[8px]">
              {recentItems.map(item => (
                <div key={`recent-${item.id}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <ProductAvatar name={item.product.name} image={item.product.image} size="sm" />
                    <span className="text-[12px] font-medium text-[#242124] line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="text-[12px] text-[#77706D] whitespace-nowrap">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
