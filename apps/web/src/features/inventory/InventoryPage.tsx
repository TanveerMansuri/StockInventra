import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { useInventory } from "../../hooks/useInventory";
import { useCategories } from "../../hooks/useCategories";
import { Search, ChevronDown } from "lucide-react";

export function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: categories } = useCategories({ limit: 100 });

  const { data, isLoading, error, refetch } = useInventory({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    status: statusFilter || undefined,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(searchQuery);
    }
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= 0) return 'text-[#DC2626]';
    if (current <= min) return 'text-[#D97706]';
    return 'text-[#059669]'; // green for healthy
  };

  const getStatusClasses = (status: string) => {
    if (status === 'IN_STOCK') return 'bg-[#059669]/10 text-[#059669]';
    if (status === 'LOW_STOCK') return 'bg-[#D97706]/10 text-[#D97706]';
    return 'bg-[#DC2626]/10 text-[#DC2626]';
  };

  return (
    <PageContainer
      title="Inventory"
      description="Track your stock levels and movements."
    >
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] shadow-sm flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-[12px] p-[20px] border-b border-[#EAE5E0] bg-[#FCFCFB]">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
              <Search size={16} className="text-[#77706D]" />
            </div>
            <input 
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full h-[40px] pl-[36px] pr-[12px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] text-[14px] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20"
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="appearance-none block h-[40px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] py-[10px] pl-[14px] pr-[36px] text-[14px] font-medium text-[#242124] focus:border-[#7A1830] focus:outline-none focus:ring-1 focus:ring-[#7A1830] transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[14px] text-[#77706D]">
              <ChevronDown size={16} />
            </div>
          </div>
          <div className="relative w-full sm:w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none block h-[40px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] py-[10px] pl-[14px] pr-[36px] text-[14px] font-medium text-[#242124] focus:border-[#7A1830] focus:outline-none focus:ring-1 focus:ring-[#7A1830] transition-colors cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[14px] text-[#77706D]">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#EAE5E0] bg-[#FFFFFF]">
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Product</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Stock In</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Sold</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Current Stock</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Min. Stock</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Status</th>
                <th className="px-[20px] py-[12px] text-[13px] font-semibold text-[#242124]">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-[40px] text-[14px] text-[#77706D]">Loading inventory...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-[40px] text-[14px] text-red-600">
                    <div className="flex flex-col items-center gap-[12px]">
                      <span>{error}</span>
                      <button onClick={refetch} className="px-[16px] py-[8px] bg-[#F5EFE6] text-[#7A1830] font-medium rounded-[6px] hover:bg-[#EAE5E0]">Retry</button>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-[40px] text-[14px] text-[#77706D]">No inventory records found.</td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.product.id} className="border-b border-[#EAE5E0] last:border-0 hover:bg-[#FDFCF9] transition-colors">
                    <td className="px-[20px] py-[12px]">
                      <div className="flex items-center gap-[12px]">
                        {item.product.image ? (
                          <img src={item.product.image} className="w-[36px] h-[36px] rounded-[6px] object-cover border border-[#EAE5E0]" />
                        ) : (
                          <div className="w-[36px] h-[36px] rounded-[6px] bg-[#F5EFE6] flex items-center justify-center text-[14px] font-bold text-[#7A1830]">
                            {item.product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-[#242124]">{item.product.name}</span>
                          <span className="text-[12px] text-[#77706D]">{item.product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-[20px] py-[12px] text-[14px] text-[#77706D] font-medium">{item.stockIn}</td>
                    <td className="px-[20px] py-[12px] text-[14px] text-[#77706D] font-medium">{item.sold}</td>
                    <td className="px-[20px] py-[12px]">
                      <span className={`text-[14px] font-bold ${getStockColor(item.currentStock, item.minimumStock)}`}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-[20px] py-[12px] text-[14px] text-[#77706D] font-medium">{item.minimumStock}</td>
                    <td className="px-[20px] py-[12px]">
                      <span className={`inline-flex items-center px-[10px] py-[4px] rounded-full text-[12px] font-semibold ${getStatusClasses(item.status)}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-[20px] py-[12px] text-[13px] text-[#242124] font-medium">
                      {new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
