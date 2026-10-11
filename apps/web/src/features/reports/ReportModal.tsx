import { X, Printer, Package2, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { useRef } from "react";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reportType?: string;
  reportData: any;
  isLoading: boolean;
  error: string | null;
  periodLabel: string;
  onRetry?: () => void;
}

export function ReportModal({
  isOpen,
  onClose,
  title,
  reportType = "sales",
  reportData,
  isLoading,
  error,
  periodLabel,
  onRetry,
}: ReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const formatCurrency = useCurrencyFormatter();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const details: any[] = Array.isArray(reportData?.details) ? reportData.details : [];
  const summary: Record<string, any> = reportData?.summary || {};
  const hasDetails = details.length > 0;

  // Render dedicated summary KPI cards
  const renderSummaryCards = () => {
    if (!summary || Object.keys(summary).length === 0) return null;

    let kpis: { label: string; value: string; hint?: string }[] = [];

    if (reportType === "sales") {
      kpis = [
        { label: "Completed Sales", value: (summary.transactionCount ?? 0).toLocaleString() },
        { label: "Total Units Sold", value: (summary.unitsSold ?? 0).toLocaleString() },
        { label: "Gross Subtotal", value: formatCurrency(summary.subtotal ?? 0) },
        { label: "Discounts Given", value: formatCurrency(summary.discounts ?? 0) },
        { label: "Net Sales Revenue", value: formatCurrency(summary.finalAmount ?? 0) },
      ];
    } else if (reportType === "profit") {
      kpis = [
        { label: "Net Sales", value: formatCurrency(summary.netSales ?? 0) },
        { label: "Cost of Goods (COGS)", value: formatCurrency(summary.costOfGoodsSold ?? 0) },
        { label: "Gross Profit", value: formatCurrency(summary.grossProfit ?? 0) },
        { label: "Overall Margin", value: `${Number(summary.marginPercent ?? 0).toFixed(2)}%` },
      ];
    } else if (reportType === "inventory") {
      const diff = (summary.totalClosingValuation ?? 0) - (summary.totalOpeningValuation ?? 0);
      kpis = [
        { label: "Opening Stock Value", value: formatCurrency(summary.totalOpeningValuation ?? 0) },
        { label: "Closing Stock Value", value: formatCurrency(summary.totalClosingValuation ?? 0) },
        {
          label: "Net Value Change",
          value: `${diff >= 0 ? "+" : ""}${formatCurrency(diff)}`,
        },
      ];
    } else if (reportType === "products") {
      const totalUnits = details.reduce((acc, d) => acc + (d.unitsSold || 0), 0);
      const totalRev = details.reduce((acc, d) => acc + (d.revenue || 0), 0);
      const totalProf = details.reduce((acc, d) => acc + (d.profit || 0), 0);
      kpis = [
        { label: "Products Analyzed", value: (summary.totalProducts ?? details.length).toLocaleString() },
        { label: "Total Units Sold", value: totalUnits.toLocaleString() },
        { label: "Total Revenue", value: formatCurrency(totalRev) },
        { label: "Total Profit", value: formatCurrency(totalProf) },
      ];
    } else {
      kpis = Object.entries(summary).map(([key, value]) => {
        let displayVal = String(value);
        if (typeof value === "number") {
          displayVal = key.toLowerCase().includes("percent") || key.toLowerCase().includes("margin")
            ? `${value.toFixed(2)}%`
            : key.toLowerCase().includes("count") || key.toLowerCase().includes("units") || key.toLowerCase().includes("products")
            ? value.toLocaleString()
            : formatCurrency(value);
        }
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        return { label, value: displayVal };
      });
    }

    return (
      <div className="mb-[28px]">
        <h3 className="text-[#7A1830] text-[14px] font-bold uppercase tracking-wider mb-[12px]">
          Executive Summary
        </h3>
        <div className={`grid gap-[12px] grid-cols-2 ${kpis.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="p-[14px] rounded-[10px] bg-[#FAF8F5] border border-[#EAE5E0] flex flex-col justify-between"
            >
              <span className="text-[11px] font-semibold text-[#77706D] uppercase tracking-wider">{kpi.label}</span>
              <span className="text-[17px] font-bold text-[#242124] mt-[6px] tracking-tight">{kpi.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render dedicated tables tailored to each report type
  const renderTable = () => {
    if (!hasDetails) {
      return (
        <div className="flex flex-col items-center justify-center py-[56px] px-[24px] text-center bg-[#FAF8F5] rounded-[12px] border border-[#EAE5E0] my-[24px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#7A1830]/10 flex items-center justify-center text-[#7A1830] mb-[12px]">
            <FileText className="w-[24px] h-[24px]" />
          </div>
          <h4 className="text-[16px] font-bold text-[#242124]">No data available for this period</h4>
          <p className="text-[13px] text-[#77706D] mt-[6px] max-w-[420px]">
            There are no recorded transactions or stock movements matching the period "{periodLabel}". Try choosing another date range or selecting Custom Range.
          </p>
        </div>
      );
    }

    if (reportType === "sales") {
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] text-[11px] font-semibold text-[#7A1830] uppercase tracking-wider">
                <th className="py-[10px] pl-[4px]">Invoice ID</th>
                <th className="py-[10px]">Date & Time</th>
                <th className="py-[10px] text-center">Items</th>
                <th className="py-[10px] text-center">Units</th>
                <th className="py-[10px] text-right">Subtotal</th>
                <th className="py-[10px] text-right">Discount</th>
                <th className="py-[10px] text-right pr-[4px]">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE6]">
              {details.map((row, i) => {
                const formattedId = row.id?.length > 10 ? `SI-${row.id.slice(-6).toUpperCase()}` : row.id;
                const dateStr = row.timestamp ? new Date(row.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
                return (
                  <tr key={i} className="hover:bg-[#FAF8F5]/60 transition-colors break-inside-avoid">
                    <td className="py-[10px] pl-[4px] font-medium text-[#242124]">{formattedId}</td>
                    <td className="py-[10px] text-[#77706D]">{dateStr}</td>
                    <td className="py-[10px] text-center text-[#77706D]">{row.itemsCount ?? 1}</td>
                    <td className="py-[10px] text-center font-medium text-[#242124]">{row.units ?? "-"}</td>
                    <td className="py-[10px] text-right text-[#77706D]">{formatCurrency(row.subtotal)}</td>
                    <td className="py-[10px] text-right text-[#C62828]">{row.discount > 0 ? `-${formatCurrency(row.discount)}` : "-"}</td>
                    <td className="py-[10px] text-right pr-[4px] font-bold text-[#242124]">{formatCurrency(row.finalAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (reportType === "profit") {
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] text-[11px] font-semibold text-[#7A1830] uppercase tracking-wider">
                <th className="py-[10px] pl-[4px]">Invoice ID</th>
                <th className="py-[10px]">Date & Time</th>
                <th className="py-[10px] text-right">Net Sales</th>
                <th className="py-[10px] text-right">Cost (COGS)</th>
                <th className="py-[10px] text-right">Gross Profit</th>
                <th className="py-[10px] text-right pr-[4px]">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE6]">
              {details.map((row, i) => {
                const formattedId = row.id?.length > 10 ? `SI-${row.id.slice(-6).toUpperCase()}` : row.id;
                const dateStr = row.timestamp ? new Date(row.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
                return (
                  <tr key={i} className="hover:bg-[#FAF8F5]/60 transition-colors break-inside-avoid">
                    <td className="py-[10px] pl-[4px] font-medium text-[#242124]">{formattedId}</td>
                    <td className="py-[10px] text-[#77706D]">{dateStr}</td>
                    <td className="py-[10px] text-right text-[#242124] font-medium">{formatCurrency(row.netSales)}</td>
                    <td className="py-[10px] text-right text-[#77706D]">{formatCurrency(row.costOfGoodsSold)}</td>
                    <td className="py-[10px] text-right font-semibold text-[#166534]">{formatCurrency(row.grossProfit)}</td>
                    <td className="py-[10px] text-right pr-[4px] font-medium text-[#242124]">{Number(row.marginPercent ?? 0).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (reportType === "inventory") {
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] text-[11px] font-semibold text-[#7A1830] uppercase tracking-wider">
                <th className="py-[10px] pl-[4px]">Product</th>
                <th className="py-[10px] text-right">Cost</th>
                <th className="py-[10px] text-center">Opening</th>
                <th className="py-[10px] text-center">In (+)</th>
                <th className="py-[10px] text-center">Out (-)</th>
                <th className="py-[10px] text-center">Adj (±)</th>
                <th className="py-[10px] text-center">Closing</th>
                <th className="py-[10px] text-right pr-[4px]">Closing Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE6]">
              {details.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAF8F5]/60 transition-colors break-inside-avoid">
                  <td className="py-[10px] pl-[4px]">
                    <div className="font-medium text-[#242124]">{row.name}</div>
                    <div className="text-[11px] text-[#77706D]">{row.sku}</div>
                  </td>
                  <td className="py-[10px] text-right text-[#77706D]">{formatCurrency(row.costPrice)}</td>
                  <td className="py-[10px] text-center text-[#77706D]">{row.openingStock}</td>
                  <td className="py-[10px] text-center text-[#166534] font-medium">+{row.receipts}</td>
                  <td className="py-[10px] text-center text-[#C62828] font-medium">-{row.sold}</td>
                  <td className="py-[10px] text-center text-[#77706D]">{row.adjustments !== 0 ? (row.adjustments > 0 ? `+${row.adjustments}` : row.adjustments) : "-"}</td>
                  <td className="py-[10px] text-center font-bold text-[#242124]">{row.closingStock}</td>
                  <td className="py-[10px] text-right pr-[4px] font-semibold text-[#242124]">{formatCurrency(row.closingValuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (reportType === "products") {
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] text-[11px] font-semibold text-[#7A1830] uppercase tracking-wider">
                <th className="py-[10px] pl-[4px]">Product</th>
                <th className="py-[10px] text-center">Current Stock</th>
                <th className="py-[10px] text-center">Units Sold</th>
                <th className="py-[10px] text-right">Revenue</th>
                <th className="py-[10px] text-right">Gross Profit</th>
                <th className="py-[10px] text-center pr-[4px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE6]">
              {details.map((row, i) => {
                const isOutOfStock = row.status === "OUT_OF_STOCK" || row.currentStock <= 0;
                const isLowStock = row.status === "LOW_STOCK" || (!isOutOfStock && row.currentStock <= (row.lowStockThreshold || 10));
                return (
                  <tr key={i} className="hover:bg-[#FAF8F5]/60 transition-colors break-inside-avoid">
                    <td className="py-[10px] pl-[4px]">
                      <div className="font-medium text-[#242124]">{row.name}</div>
                      <div className="text-[11px] text-[#77706D]">{row.sku}</div>
                    </td>
                    <td className="py-[10px] text-center font-medium text-[#242124]">{row.currentStock}</td>
                    <td className="py-[10px] text-center font-bold text-[#7A1830]">{row.unitsSold}</td>
                    <td className="py-[10px] text-right font-medium text-[#242124]">{formatCurrency(row.revenue)}</td>
                    <td className="py-[10px] text-right font-semibold text-[#166534]">{formatCurrency(row.profit)}</td>
                    <td className="py-[10px] text-center pr-[4px]">
                      <span
                        className={`inline-block px-[8px] py-[2px] rounded-[6px] text-[11px] font-semibold ${
                          isOutOfStock
                            ? "bg-[#FDE8E8] text-[#9B1C1C]"
                            : isLowStock
                            ? "bg-[#FEF08A]/40 text-[#854D0E]"
                            : "bg-[#E7F4EB] text-[#166534]"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Fallback table for any other structure
    const headers = Object.keys(details[0] || {});
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#EAE5E0]">
              {headers.map((h, i) => (
                <th key={i} className="py-[10px] text-[11px] font-semibold text-[#7A1830] uppercase">
                  {h.replace(/([A-Z])/g, " $1")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {details.map((row: any, i: number) => (
              <tr key={i} className="border-b border-[#EAE5E0] last:border-0 break-inside-avoid">
                {headers.map((h, j) => {
                  let val = row[h];
                  if (typeof val === "number" && !h.toLowerCase().includes("count") && !h.toLowerCase().includes("units") && !h.toLowerCase().includes("stock") && !h.toLowerCase().includes("percent")) {
                    val = formatCurrency(val);
                  } else if (typeof val === "number" && h.toLowerCase().includes("percent")) {
                    val = `${val.toFixed(2)}%`;
                  } else if (h.toLowerCase().includes("timestamp") || h.toLowerCase().includes("date")) {
                    val = new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  }
                  return (
                    <td key={j} className="py-[10px] text-[#77706D]">
                      {String(val ?? "-")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-[20px] overflow-y-auto print:p-0 print:overflow-visible bg-black/60 backdrop-blur-sm">
      
      {/* Action Bar Floating Top Right (Excluded on Print) */}
      <div className="fixed top-[20px] right-[24px] flex items-center gap-[10px] z-50 print:hidden">
        {!isLoading && !error && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-[8px] px-[16px] py-[9px] bg-[#FFFFFF] text-[#242124] rounded-[8px] shadow-md font-semibold text-[13px] border border-[#EAE5E0] hover:bg-[#FAF5EE] transition-colors"
          >
            <Printer className="w-[15px] h-[15px] text-[#7A1830]" />
            Print / PDF
          </button>
        )}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-[38px] h-[38px] bg-[#FFFFFF] text-[#242124] rounded-full shadow-md border border-[#EAE5E0] hover:bg-[#FAF5EE] transition-colors"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Main A4 Document Preview Card */}
      <div
        ref={printRef}
        className="relative bg-[#FFFFFF] text-[#242124] w-full max-w-[880px] min-h-[600px] rounded-[16px] shadow-2xl flex flex-col my-[28px] p-[32px] sm:p-[48px] border border-[#EAE5E0] print:my-0 print:p-0 print:shadow-none print:border-none print:w-full print:max-w-none"
      >
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[460px] py-[64px]">
            <div className="w-[48px] h-[48px] border-4 border-[#7A1830] border-t-transparent rounded-full animate-spin mb-[16px]" />
            <h3 className="text-[17px] font-bold text-[#242124]">Generating Report Preview</h3>
            <p className="text-[13px] text-[#77706D] mt-[4px]">Fetching verified records for {periodLabel}...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[460px] py-[64px] text-center px-[24px]">
            <div className="w-[52px] h-[52px] rounded-full bg-[#FDE8E8] text-[#9B1C1C] flex items-center justify-center mb-[16px]">
              <AlertCircle className="w-[28px] h-[28px]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#242124]">Unable to Load Report</h3>
            <p className="text-[14px] text-[#77706D] mt-[6px] max-w-[420px]">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-[20px] px-[20px] py-[9px] bg-[#7A1830] hover:bg-[#641326] text-white rounded-[8px] font-medium text-[13px] transition-colors flex items-center gap-[8px]"
              >
                <RefreshCw className="w-[14px] h-[14px]" />
                Retry Loading
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] pb-[20px] border-b border-[#EAE5E0]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[42px] h-[42px] bg-[#7A1830] rounded-[8px] flex items-center justify-center shrink-0">
                  <Package2 className="w-[24px] h-[24px] text-white" />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-[#7A1830] tracking-wide leading-tight">STOCK INVENTRA</h1>
                  <p className="text-[11px] text-[#77706D] uppercase tracking-wider">Business Analytics &amp; Reporting</p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-[10px] py-[3px] rounded-[6px] text-[12px] font-semibold bg-[#FAF5EE] text-[#7A1830] border border-[#EAE5E0]">
                  Period: {periodLabel}
                </span>
                <p className="text-[11px] text-[#77706D] mt-[4px]">
                  Generated on {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Title Section */}
            <div className="py-[20px] border-b border-[#EAE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-[8px]">
              <div>
                <h2 className="text-[20px] font-bold text-[#242124] uppercase tracking-tight">{title}</h2>
                <p className="text-[13px] text-[#77706D] mt-[2px]">
                  Official performance breakdown based on verified transactions.
                </p>
              </div>
              <div className="text-[12px] font-semibold text-[#7A1830]">
                {details.length} {details.length === 1 ? "Record" : "Records"} Found
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 pt-[24px]">
              {renderSummaryCards()}
              <div className="mt-[20px]">
                <h3 className="text-[#7A1830] text-[14px] font-bold uppercase tracking-wider mb-[12px]">
                  Detailed Breakdown
                </h3>
                {renderTable()}
              </div>
            </div>

            {/* Report Footer */}
            <div className="mt-[48px] pt-[16px] border-t border-[#EAE5E0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#77706D] gap-[8px]">
              <span>Stock Inventra ERP &middot; Internal Business Report</span>
              <span>All monetary figures in designated currency</span>
            </div>
          </div>
        )}
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
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
          .fixed.inset-0 > div[ref] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .fixed.inset-0 > div[ref] * {
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
