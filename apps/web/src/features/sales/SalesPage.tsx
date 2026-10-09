import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSales } from "../../hooks/useSales";
import { useProducts } from "../../hooks/useProducts";
import { salesService } from "../../services/api";
import { Search, Plus, Calendar, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Receipt, XCircle, ChevronDown } from "lucide-react";

export function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: sales, isLoading, error, refetch } = useSales({ limit: 100 });
  const { data: products } = useProducts({ limit: 100 });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (statusFilter !== "all" && sale.status !== statusFilter) return false;

      if (dateFilter !== "all") {
        const saleDate = new Date(sale.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateFilter === "today") {
          if (saleDate < startOfToday) return false;
        } else if (dateFilter === "7days") {
          const past7 = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (saleDate < past7) return false;
        } else if (dateFilter === "30days") {
          const past30 = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (saleDate < past30) return false;
        } else if (dateFilter === "thisMonth") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (saleDate < startOfMonth) return false;
        } else if (dateFilter === "lastMonth") {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          if (saleDate < startOfLastMonth || saleDate > endOfLastMonth) return false;
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const displayId = sale.id.startsWith("SI-") 
          ? sale.id 
          : `SI-${new Date(sale.createdAt).getFullYear()}-${sale.id.slice(-4).toUpperCase()}`;
          
        const idMatch = displayId.toLowerCase().includes(query);
        
        const productMatch = sale.items?.some((item: any) => {
           const product = products?.find(p => p.id === item.productId);
           return product?.name.toLowerCase().includes(query);
        });

        if (!idMatch && !productMatch) return false;
      }

      return true;
    });
  }, [sales, products, statusFilter, dateFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCancelSale = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this sale? This will restore inventory.")) {
      try {
        const res = await salesService.cancelSale(id);
        if (res.success) {
          refetch();
        } else {
          alert("Failed to cancel sale");
        }
      } catch (err: any) {
        alert(err.message || "An error occurred");
      }
    }
  };

  const getStatusClasses = (status: string) => {
    if (status === 'COMPLETED') return 'bg-[#E7F4EB] text-[#166534]';
    if (status === 'PENDING') return 'bg-[#FFF2D6] text-[#92400E]';
    return 'bg-[#FDE8E7] text-[#B42318]';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-[44px] h-[44px] flex items-center justify-center rounded-[10px] text-[14px] font-medium transition-colors border ${
            currentPage === i 
              ? 'bg-[#7A1830] text-white border-[#7A1830]' 
              : 'bg-white text-[#242124] border-[#EAE5E0] hover:bg-[#F5EFE6]'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FCFCFB] p-[26px] lg:p-[32px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[32px]">
        <div>
          <h1 className="text-[36px] font-bold text-[#242124] leading-[42px]">Sales</h1>
          <p className="text-[16px] text-[#77706D] mt-[4px]">View and manage sales history.</p>
        </div>
        <Link to="/sales/new" className="mt-[16px] sm:mt-0">
          <button className="flex items-center h-[52px] w-[164px] px-[20px] bg-[#7A1830] hover:bg-[#641326] text-white font-semibold text-[15px] rounded-[12px] transition-colors shadow-sm">
            <Plus size={20} className="mr-[10px]" />
            New Sale
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] p-[18px] shadow-[0_2px_5px_rgba(36,33,36,0.04)] mb-[20px]">
        <div className="flex flex-col lg:flex-row gap-[16px]">
          
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none">
              <Search size={20} className="text-[#77706D]" />
            </div>
            <input 
              type="text"
              placeholder="Search sales by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[56px] pl-[46px] pr-[16px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[15px] text-[#242124] placeholder:text-[#77706D] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20"
            />
          </div>

          {/* Date Filter */}
          <div className="relative w-full lg:w-[275px]">
            <div className="absolute inset-y-0 left-0 pl-[16px] flex items-center pointer-events-none">
              <Calendar size={18} className="text-[#77706D]" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-[56px] pl-[44px] pr-[36px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[15px] text-[#242124] appearance-none outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-[16px] flex items-center pointer-events-none">
              <ChevronDown size={18} className="text-[#77706D]" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full lg:w-[264px]">
            <div className="absolute inset-y-0 left-0 pl-[16px] flex items-center pointer-events-none">
              <Filter size={18} className="text-[#77706D]" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-[56px] pl-[44px] pr-[36px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] text-[15px] text-[#242124] appearance-none outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-[16px] flex items-center pointer-events-none">
              <ChevronDown size={18} className="text-[#77706D]" />
            </div>
          </div>

        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] bg-[#FFFFFF]">
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Sale ID</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Date</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Items</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Subtotal</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Discount</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Tax</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Final Amount</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Profit</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Status</th>
                <th className="px-[18px] py-[16px] text-[12px] font-semibold text-[#77706D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-[60px] text-[15px] text-[#77706D]">
                    Loading sales data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="text-center py-[80px]">
                    <div className="flex flex-col items-center justify-center">
                      <XCircle size={32} className="text-[#DC2626] mb-[12px]" />
                      <span className="text-[16px] font-medium text-[#242124]">Failed to load sales</span>
                      <span className="text-[14px] text-[#77706D] mt-[4px] mb-[16px]">{error}</span>
                      <button 
                        onClick={refetch}
                        className="h-[40px] px-[16px] bg-white border border-[#EAE5E0] hover:bg-[#F5EFE6] text-[#242124] font-medium text-[14px] rounded-[8px] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-[80px]">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt size={32} className="text-[#EAE5E0] mb-[12px]" />
                      <span className="text-[16px] font-medium text-[#242124]">No sales found</span>
                      <span className="text-[14px] text-[#77706D] mt-[4px]">Try adjusting your search or filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSales.map((sale: any) => {
                  const displayId = sale.id.startsWith("SI-") 
                    ? sale.id 
                    : `SI-${new Date(sale.createdAt).getFullYear()}-${sale.id.slice(-4).toUpperCase()}`;
                    
                  const date = new Date(sale.createdAt);
                  const dateString = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                  const timeString = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  
                  const itemsCount = sale.items?.length || 0;
                  
                  // Calculate tax if not present explicitly. 
                  // Final Amount = Subtotal - Discount + Tax => Tax = Final Amount - Subtotal + Discount
                  const calculatedTax = sale.finalAmount - sale.subtotal + sale.discount;
                  const tax = Math.max(0, calculatedTax);

                  return (
                    <tr key={sale.id} className="border-b border-[#EAE5E0] last:border-0 hover:bg-[#FDFCF9] transition-colors h-[80px]">
                      <td className="px-[18px] text-[14px] font-medium text-[#242124]">{displayId}</td>
                      <td className="px-[18px]">
                        <div className="flex flex-col">
                          <span className="text-[14px] text-[#242124]">{dateString}</span>
                          <span className="text-[13px] text-[#77706D]">{timeString}</span>
                        </div>
                      </td>
                      <td className="px-[18px] text-[14px] text-[#242124]">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</td>
                      <td className="px-[18px] text-[14px] text-[#242124]">{formatCurrency(sale.subtotal)}</td>
                      <td className="px-[18px] text-[14px] text-[#242124]">{formatCurrency(sale.discount)}</td>
                      <td className="px-[18px] text-[14px] text-[#242124]">{formatCurrency(tax)}</td>
                      <td className="px-[18px] text-[14px] font-bold text-[#7A1830]">{formatCurrency(sale.finalAmount)}</td>
                      <td className="px-[18px] text-[14px] font-medium">
                        <span className={sale.grossProfit >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}>
                          {formatCurrency(sale.grossProfit)}
                        </span>
                      </td>
                      <td className="px-[18px]">
                        <span className={`inline-flex px-[12px] py-[7px] rounded-[10px] text-[12px] font-semibold capitalize ${getStatusClasses(sale.status)}`}>
                          {sale.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-[18px]">
                        <div className="relative">
                          <button 
                            className="w-[48px] h-[48px] flex items-center justify-center border border-[#EAE5E0] rounded-[10px] bg-white hover:bg-[#F5EFE6] transition-colors focus:outline-none"
                            onClick={() => setOpenDropdownId(openDropdownId === sale.id ? null : sale.id)}
                          >
                            <MoreHorizontal size={20} className="text-[#242124]" />
                          </button>
                          
                          {openDropdownId === sale.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                              <div className="absolute right-0 top-[52px] w-[180px] bg-white border border-[#EAE5E0] rounded-[10px] shadow-lg z-20 py-[6px]">
                                <button 
                                  className="w-full text-left px-[16px] py-[10px] text-[14px] text-[#242124] hover:bg-[#F5EFE6] flex items-center"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <Receipt size={16} className="mr-[10px] text-[#77706D]" />
                                  View Details
                                </button>
                                {sale.status === "COMPLETED" && (
                                  <button 
                                    className="w-full text-left px-[16px] py-[10px] text-[14px] text-[#DC2626] hover:bg-[#FDE8E7] flex items-center"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleCancelSale(sale.id);
                                    }}
                                  >
                                    <XCircle size={16} className="mr-[10px]" />
                                    Cancel Sale
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSales.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-[24px] py-[16px] border-t border-[#EAE5E0] bg-[#FFFFFF]">
            <span className="text-[14px] text-[#77706D] mb-[16px] sm:mb-0">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} sales
            </span>
            <div className="flex items-center gap-[8px]">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-[44px] h-[44px] flex items-center justify-center border border-[#EAE5E0] rounded-[10px] bg-white text-[#242124] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5EFE6]"
              >
                <ChevronLeft size={20} />
              </button>
              
              {renderPagination()}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-[44px] h-[44px] flex items-center justify-center border border-[#EAE5E0] rounded-[10px] bg-white text-[#242124] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5EFE6]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
