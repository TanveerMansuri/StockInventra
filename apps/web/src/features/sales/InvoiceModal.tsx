import { useState, useRef } from "react";
import { Printer, X, Receipt, Store, CheckCircle2 } from "lucide-react";
import { Sale } from "@stock-inventra/types";
import { useSettings } from "../../hooks/useSettings";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { UNIT_SHORT_LABELS, formatQuantityWithUnit } from "@stock-inventra/types";

interface InvoiceModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ sale, isOpen, onClose }: InvoiceModalProps) {
  const [layout, setLayout] = useState<"a4" | "thermal">("a4");
  const { data: settings } = useSettings();
  const formatCurrency = useCurrencyFormatter();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const displayId = sale.id.startsWith("SI-")
    ? sale.id
    : `SI-${new Date(sale.createdAt).getFullYear()}-${sale.id.slice(-4).toUpperCase()}`;

  const date = new Date(sale.createdAt);
  const formattedDate = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const business = settings?.business || {
    businessName: "Stock Inventra",
    email: "info@stockinventra.com",
    phone: "",
    address: "",
  };

  const handlePrint = () => {
    window.print();
  };

  const taxableAmount = Math.max(0, sale.subtotal - (sale.discount || 0));
  const hasTax = (sale.tax || 0) > 0;
  const hasDiscount = (sale.discount || 0) > 0;
  const hasAdjustment = sale.adjustment !== undefined && sale.adjustment !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto print:p-0 print:overflow-visible print:bg-transparent">
      <div
        className={`bg-[#FFFFFF] w-full ${
          layout === "a4" ? "max-w-[760px]" : "max-w-[420px]"
        } max-h-[92vh] rounded-[16px] border border-[#EAE5E0] shadow-2xl flex flex-col overflow-hidden my-auto print:max-h-none print:max-w-none print:shadow-none print:border-none print:rounded-none print:m-0`}
      >
        {/* Top Modal Controls (Excluded on Print) */}
        <div className="px-[20px] py-[14px] border-b border-[#EAE5E0] flex items-center justify-between bg-[#FCFCFB] print:hidden gap-[12px] flex-wrap">
          <div className="flex items-center gap-[8px]">
            <Receipt className="text-[#7A1830] w-[18px] h-[18px]" />
            <h2 className="text-[15px] font-bold text-[#242124]">Printable Invoice</h2>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* Layout Mode Selector */}
            <div className="inline-flex rounded-[8px] bg-[#EAE5E0]/60 p-[2px] text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setLayout("a4")}
                className={`px-[10px] py-[4px] rounded-[6px] transition-colors ${
                  layout === "a4"
                    ? "bg-[#FFFFFF] text-[#7A1830] font-semibold shadow-xs"
                    : "text-[#77706D] hover:text-[#242124]"
                }`}
              >
                Standard A4
              </button>
              <button
                type="button"
                onClick={() => setLayout("thermal")}
                className={`px-[10px] py-[4px] rounded-[6px] transition-colors ${
                  layout === "thermal"
                    ? "bg-[#FFFFFF] text-[#7A1830] font-semibold shadow-xs"
                    : "text-[#77706D] hover:text-[#242124]"
                }`}
              >
                Thermal (80mm)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="h-[34px] px-[14px] bg-[#7A1830] hover:bg-[#641326] text-white font-medium text-[12px] rounded-[8px] transition-colors flex items-center gap-[6px] shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              onClick={onClose}
              className="h-[34px] w-[34px] flex items-center justify-center rounded-[8px] border border-[#EAE5E0] text-[#77706D] hover:bg-[#F5EFE6] hover:text-[#242124] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          ref={printRef}
          className="p-[28px] sm:p-[36px] overflow-y-auto flex-1 font-sans text-[#242124] print:p-0 print:overflow-visible print:text-[#111111]"
        >
          {layout === "a4" ? (
            /* =============================================================== */
            /* STANDARD A4 RETAIL INVOICE TEMPLATE                             */
            /* =============================================================== */
            <div className="invoice-a4-sheet flex flex-col min-h-full">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-[16px] pb-[20px] border-b border-[#EAE5E0] print:border-[#CCCCCC]">
                <div className="flex items-start gap-[12px]">
                  <div className="w-[42px] h-[42px] rounded-[8px] bg-[#7A1830] flex items-center justify-center text-white shrink-0 mt-[2px] print:border print:border-[#7A1830]">
                    <Store className="w-[22px] h-[22px]" />
                  </div>
                  <div>
                    <h1 className="text-[20px] font-bold text-[#7A1830] tracking-tight leading-tight">
                      {business.businessName || "Stock Inventra"}
                    </h1>
                    {business.address && (
                      <p className="text-[12px] text-[#77706D] mt-[3px] leading-relaxed max-w-[340px] print:text-[#333333]">
                        {business.address}
                      </p>
                    )}
                    <div className="text-[12px] text-[#77706D] mt-[3px] flex gap-[12px] flex-wrap print:text-[#333333]">
                      {business.phone && <span>Tel: {business.phone}</span>}
                      {business.email && <span>Email: {business.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex flex-col sm:items-end w-full sm:w-auto pt-[4px]">
                  <span className="text-[14px] font-bold text-[#7A1830] uppercase tracking-wider">
                    Retail Tax Invoice
                  </span>
                  <div className="mt-[6px] text-[12px]">
                    <span className="text-[#77706D] print:text-[#555555]">Invoice No: </span>
                    <span className="font-bold text-[#242124] print:text-[#111111]">{displayId}</span>
                  </div>
                  <div className="text-[12px] text-[#77706D] mt-[2px] print:text-[#555555]">
                    <span>Date: </span>
                    <span className="font-medium text-[#242124] print:text-[#111111]">
                      {formattedDate} &bull; {formattedTime}
                    </span>
                  </div>
                  <div className="mt-[6px]">
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-semibold bg-[#E7F4EB] text-[#166534] border border-[#166534]/20 print:border print:border-[#166534]">
                      <CheckCircle2 size={11} className="print:hidden" />
                      {sale.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-[20px] flex-1">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EAE5E0] text-[11px] font-bold text-[#7A1830] uppercase tracking-wider print:border-[#999999]">
                      <th className="py-[10px] pl-[6px] w-[32px]">#</th>
                      <th className="py-[10px]">Item Description</th>
                      <th className="py-[10px] text-center w-[90px]">Qty / Unit</th>
                      <th className="py-[10px] text-right w-[110px]">Unit Rate</th>
                      <th className="py-[10px] text-right pr-[6px] w-[110px]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE6] print:divide-[#CCCCCC]">
                    {sale.items?.map((item, idx) => {
                      const unitShort = UNIT_SHORT_LABELS[item.unit || "Piece"] || item.unit || "pcs";
                      const productName = item.product?.name || "Product";
                      const sku = item.product?.sku;
                      return (
                        <tr key={item.id} className="break-inside-avoid hover:bg-[#FAF8F5]/50 transition-colors">
                          <td className="py-[10px] pl-[6px] text-[#77706D] text-[12px]">{idx + 1}</td>
                          <td className="py-[10px] pr-[12px]">
                            <div className="font-semibold text-[#242124] print:text-[#111111]">{productName}</div>
                            {sku && <div className="text-[11px] text-[#77706D] print:text-[#555555]">SKU: {sku}</div>}
                          </td>
                          <td className="py-[10px] text-center whitespace-nowrap text-[#242124] font-medium print:text-[#111111]">
                            {formatQuantityWithUnit(item.quantity, item.unit)}
                          </td>
                          <td className="py-[10px] text-right whitespace-nowrap text-[#77706D] print:text-[#333333]">
                            {formatCurrency(item.unitPrice)}/{unitShort}
                          </td>
                          <td className="py-[10px] text-right pr-[6px] font-bold text-[#242124] whitespace-nowrap print:text-[#111111]">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="mt-[20px] pt-[16px] border-t border-[#EAE5E0] flex flex-col sm:flex-row justify-between items-start gap-[20px] break-inside-avoid print:border-[#CCCCCC]">
                {/* Payment & Remarks info on left */}
                <div className="w-full sm:w-1/2 text-[12px] text-[#77706D] print:text-[#333333]">
                  <div className="p-[12px] rounded-[8px] bg-[#FAF8F5] border border-[#EAE5E0] print:border-[#CCCCCC] print:bg-transparent">
                    <span className="font-semibold text-[#242124] block mb-[4px] print:text-[#111111]">Payment Info:</span>
                    <div>Payment Mode: <span className="font-medium text-[#242124] print:text-[#111111]">Cash / Card / POS</span></div>
                    <div>Payment Status: <span className="font-semibold text-[#166534]">PAID IN FULL</span></div>
                    <div className="mt-[6px] text-[11px] text-[#77706D] italic print:text-[#555555]">
                      Goods once sold are eligible for replacement within 7 days with this original invoice.
                    </div>
                  </div>
                </div>

                {/* Right Aligned Compact Totals */}
                <div className="w-full sm:w-[280px] flex flex-col gap-[7px] text-[13px]">
                  <div className="flex justify-between items-center text-[#77706D] print:text-[#333333]">
                    <span>Gross Subtotal:</span>
                    <span className="font-semibold text-[#242124] print:text-[#111111]">{formatCurrency(sale.subtotal)}</span>
                  </div>

                  {hasDiscount && (
                    <div className="flex justify-between items-center text-[#C62828] print:text-[#9B1C1C]">
                      <span>Total Discount:</span>
                      <span className="font-semibold">- {formatCurrency(sale.discount)}</span>
                    </div>
                  )}

                  {hasTax && hasDiscount && (
                    <div className="flex justify-between items-center text-[#77706D] text-[12px] print:text-[#555555]">
                      <span>Taxable Subtotal:</span>
                      <span>{formatCurrency(taxableAmount)}</span>
                    </div>
                  )}

                  {hasTax && (
                    <div className="flex justify-between items-center text-[#77706D] print:text-[#333333]">
                      <span>Applicable Tax:</span>
                      <span className="font-semibold text-[#242124] print:text-[#111111]">+ {formatCurrency(sale.tax)}</span>
                    </div>
                  )}

                  {hasAdjustment && (
                    <div className="flex justify-between items-center text-[#77706D] print:text-[#333333]">
                      <span>{sale.adjustment > 0 ? "Round-off Adjustment:" : "Adjustment / Rounding:"}</span>
                      <span className={`font-semibold ${sale.adjustment < 0 ? "text-[#C62828]" : "text-[#166534]"}`}>
                        {sale.adjustment > 0
                          ? `+ ${formatCurrency(sale.adjustment)}`
                          : `- ${formatCurrency(Math.abs(sale.adjustment))}`}
                      </span>
                    </div>
                  )}

                  {/* Final Payable prominent banner */}
                  <div className="mt-[4px] pt-[8px] border-t border-[#7A1830] print:border-[#000000]">
                    <div className="flex justify-between items-center px-[10px] py-[8px] rounded-[6px] bg-[#FAF5EE] border border-[#EAE5E0] print:bg-transparent print:border print:border-[#000000]">
                      <span className="text-[13px] font-bold text-[#7A1830] uppercase tracking-wide print:text-[#000000]">
                        Final Payable:
                      </span>
                      <span className="text-[17px] font-bold text-[#7A1830] print:text-[#000000]">
                        {formatCurrency(sale.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Footer */}
              <div className="mt-[32px] pt-[16px] border-t border-[#EAE5E0] flex flex-col sm:flex-row items-center justify-between text-center sm:text-left text-[11px] text-[#77706D] print:text-[#444444] print:border-[#CCCCCC] gap-[6px]">
                <div>
                  <p className="font-semibold text-[#242124] print:text-[#111111]">Thank you for shopping with us!</p>
                  <p>Computer-generated tax invoice. No signature required.</p>
                </div>
                <div className="text-right sm:block hidden">
                  <p className="font-medium text-[#7A1830] print:text-[#111111]">Stock Inventra ERP</p>
                  <p>www.stockinventra.com</p>
                </div>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* THERMAL RECEIPT (80mm) TEMPLATE                                 */
            /* =============================================================== */
            <div className="invoice-thermal-receipt font-mono text-[12px] leading-relaxed mx-auto max-w-[320px]">
              {/* Receipt Header */}
              <div className="text-center pb-[12px] border-b border-dashed border-[#242124]">
                <h2 className="text-[16px] font-bold text-[#242124] uppercase tracking-wide">
                  {business.businessName || "Stock Inventra"}
                </h2>
                {business.address && <p className="text-[11px] text-[#444444] mt-[2px]">{business.address}</p>}
                {business.phone && <p className="text-[11px] text-[#444444]">TEL: {business.phone}</p>}
                
                <div className="mt-[8px] pt-[6px] border-t border-dashed border-[#CCCCCC] text-[11px]">
                  <div className="font-bold tracking-wider">TAX RECEIPT</div>
                  <div>RCPT: {displayId}</div>
                  <div>{formattedDate} {formattedTime}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="py-[10px] border-b border-dashed border-[#242124]">
                <div className="flex justify-between font-bold text-[11px] pb-[4px] border-b border-[#CCCCCC]">
                  <span>ITEM</span>
                  <span>TOTAL</span>
                </div>
                <div className="flex flex-col gap-[6px] mt-[6px]">
                  {sale.items?.map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-[#242124]">{item.product?.name || "Product"}</div>
                      <div className="flex justify-between text-[#555555] text-[11px]">
                        <span>
                          {formatQuantityWithUnit(item.quantity, item.unit)} @ {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="font-semibold text-[#242124]">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="py-[10px] border-b border-dashed border-[#242124] flex flex-col gap-[4px] text-[12px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span className="font-semibold">{formatCurrency(sale.subtotal)}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-[#9B1C1C]">
                    <span>DISCOUNT:</span>
                    <span>- {formatCurrency(sale.discount)}</span>
                  </div>
                )}
                {hasTax && (
                  <div className="flex justify-between">
                    <span>TAX:</span>
                    <span>+ {formatCurrency(sale.tax)}</span>
                  </div>
                )}
                {hasAdjustment && (
                  <div className="flex justify-between">
                    <span>ROUNDING:</span>
                    <span>
                      {sale.adjustment > 0
                        ? `+ ${formatCurrency(sale.adjustment)}`
                        : `- ${formatCurrency(Math.abs(sale.adjustment))}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-bold mt-[6px] pt-[6px] border-t border-dashed border-[#242124]">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(sale.finalAmount)}</span>
                </div>
              </div>

              {/* Thermal Footer */}
              <div className="text-center pt-[12px] text-[11px] text-[#444444]">
                <p className="font-bold">STATUS: {sale.status} - PAID</p>
                <p className="mt-[6px]">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[10px] mt-[2px]">*** PLEASE KEEP THIS RECEIPT ***</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: ${layout === "thermal" ? "80mm auto" : "A4 portrait"};
            margin: ${layout === "thermal" ? "4mm" : "10mm"};
          }
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed.inset-0 {
            position: static !important;
            padding: 0 !important;
            overflow: visible !important;
            background: transparent !important;
          }
          .fixed.inset-0 > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          .fixed.inset-0 > div * {
            visibility: visible;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </div>
  );
}
