import { X, Printer, Package2 } from "lucide-react";
import { useRef } from "react";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reportData: any;
  isLoading: boolean;
  error: string | null;
  periodLabel: string;
}

export function ReportModal({ isOpen, onClose, title, reportData, isLoading, error, periodLabel }: ReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formatCurrency = useCurrencyFormatter();

  const handlePrint = () => {
    window.print();
  };

  const renderSummary = () => {
    if (!reportData?.summary) return null;
    const { summary } = reportData;
    return (
      <div className="mb-[24px]">
        <h3 className="text-[#7A1830] text-[16px] font-bold mb-[16px]">
          {title.split(" ")[0]} Summary
        </h3>
        <div className="flex flex-col gap-[12px]">
          {Object.entries(summary).map(([key, value], idx) => {
            let displayVal = String(value);
            if (typeof value === "number") {
              displayVal = key.toLowerCase().includes("percent") || key.toLowerCase().includes("margin") 
                ? `${value.toFixed(2)}%` 
                : key.toLowerCase().includes("count") || key.toLowerCase().includes("units") || key.toLowerCase().includes("products")
                  ? value.toLocaleString() 
                  : formatCurrency(value);
            }
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={idx} className="flex justify-between items-center text-[14px]">
                <span className="text-[#242124]">{label}</span>
                <span className="text-[#242124] font-medium">{displayVal}</span>
              </div>
            );
          })}
        </div>
        <div className="h-[1px] bg-[#7A1830] w-full mt-[24px]"></div>
      </div>
    );
  };

  const renderTable = () => {
    if (!reportData?.details || reportData.details.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-[48px] text-center">
          <p className="text-[14px] font-medium text-[#242124]">No data available</p>
          <p className="text-[13px] text-[#77706D] mt-[4px]">There is no data for this period.</p>
        </div>
      );
    }

    const headers = Object.keys(reportData.details[0]);
    
    return (
      <div className="w-full">
        <h3 className="text-[#7A1830] text-[16px] font-bold mb-[16px]">
          {title.split(" ")[0]} Details
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EAE5E0]">
              {headers.map((h, i) => (
                <th key={i} className="py-[12px] text-[12px] font-semibold text-[#7A1830] capitalize">
                  {h.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((row: any, i: number) => (
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
                    <td key={j} className="py-[12px] text-[13px] text-[#77706D]">
                      {String(val)}
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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-[24px] overflow-y-auto print:p-0 print:overflow-visible">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={onClose} />
      
      {/* Actions Toolbar - Hidden on print */}
      <div className="fixed top-[24px] right-[24px] flex gap-[12px] z-50 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#FFFFFF] text-[#242124] rounded-[8px] shadow-sm font-medium hover:bg-[#FAF5EE] transition-colors">
          <Printer className="w-[16px] h-[16px]" />
          Print / PDF
        </button>
        <button onClick={onClose} className="flex items-center justify-center w-[40px] h-[40px] bg-[#FFFFFF] text-[#242124] rounded-full shadow-sm hover:bg-[#FAF5EE] transition-colors">
          <X className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* A4 Document Container */}
      <div 
        ref={printRef}
        className="relative bg-[#FCFCFB] text-[#242124] w-full max-w-[800px] min-h-[1131px] rounded-[12px] shadow-2xl flex flex-col my-[40px] print:my-0 print:shadow-none print:rounded-none print:w-full print:max-w-none print:h-auto"
        style={{
          border: '1px solid #EAE5E0',
          padding: '48px 64px'
        }}
      >
        <div className="absolute inset-0 rounded-[12px] border border-[#7A1830] m-[16px] pointer-events-none print:m-0 print:border-none"></div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
            <div className="w-8 h-8 border-4 border-[#7A1830] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px] text-[#7A1830]">
            {error}
          </div>
        ) : (
          <div className="flex flex-col flex-1 z-10 print:mt-[10mm]">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-[32px]">
              <div className="w-[40px] h-[40px] bg-[#7A1830] rounded-[6px] flex items-center justify-center mb-[16px]">
                <Package2 className="w-[24px] h-[24px] text-white" />
              </div>
              <h1 className="text-[24px] font-bold text-[#7A1830] tracking-wide">STOCK INVENTRA</h1>
              <p className="text-[13px] text-[#77706D] tracking-widest mt-[4px]">INVENTORY MANAGEMENT</p>
            </div>
            
            <div className="h-[1px] bg-[#7A1830] w-full mb-[24px]"></div>
            
            <div className="flex flex-col items-center mb-[32px]">
              <h2 className="text-[20px] font-bold text-[#7A1830] mb-[8px] uppercase">{title}</h2>
              <p className="text-[14px] text-[#77706D]">Report Period: {periodLabel}</p>
            </div>

            <div className="h-[1px] bg-[#7A1830] w-full mb-[32px]"></div>

            {reportData && (
              <div className="flex-1">
                {renderSummary()}
                {renderTable()}
              </div>
            )}

            {/* Footer Section */}
            <div className="mt-[64px] pt-[24px] border-t border-[#EAE5E0] text-center text-[12px] text-[#77706D]">
              Generated by Stock Inventra &middot; {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )}
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed.inset-0.flex {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            visibility: visible;
          }
          .fixed.inset-0.flex > div {
            visibility: visible;
          }
          .fixed.inset-0.flex > div * {
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
