import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Plus, Search, Trash2, Edit, ChevronDown, MoreHorizontal } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Card } from "@stock-inventra/ui";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useCurrencyFormatter } from "../../hooks/useCurrencyFormatter";
import { productsService } from "../../services/api";
import { DeleteProductModal } from "./DeleteProductModal";

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const formatCurrency = useCurrencyFormatter();

  const { data, isLoading, refetch } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: categories = [] } = useCategories();

  // Sync if URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== debouncedSearch) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(searchQuery);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [actionMenu, setActionMenu] = useState<{ id: string; name: string; top: number; right: number } | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleClick = () => setActionMenu(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActionMenu(null);
    };
    if (actionMenu) {
      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKey);
      document.addEventListener("scroll", handleClick, true);
    }
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("scroll", handleClick, true);
    };
  }, [actionMenu]);

  const openActionMenu = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + 4;
    let right = window.innerWidth - rect.right;
    
    if (top + 110 > window.innerHeight) {
      top = rect.top - 110 - 4;
    }
    
    setActionMenu({ id, name, top, right });
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      const res = await productsService.deleteProduct(deleteProduct.id);
      if (res.success) {
        refetch();
        setDeleteProduct(null);
      } else {
        alert(res.message || "Could not delete product");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Products"
      description="Manage your products and inventory."
    >
      <div className="flex flex-col gap-24">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[12px]">
          <div className="flex flex-col sm:flex-row gap-[12px] flex-grow">
            <div className="relative flex-grow max-w-[400px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[14px] text-[#77706D]">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="block h-[44px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] py-[10px] pl-[40px] pr-[14px] text-[14px] text-[#242124] placeholder:text-[#77706D] focus:border-[#781529] focus:outline-none focus:ring-1 focus:ring-[#781529] transition-colors"
              />
            </div>
            
            <div className="relative w-full sm:w-[190px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none block h-[44px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] py-[10px] pl-[14px] pr-[36px] text-[14px] font-medium text-[#242124] focus:border-[#781529] focus:outline-none focus:ring-1 focus:ring-[#781529] transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[14px] text-[#77706D]">
                <ChevronDown size={16} />
              </div>
            </div>
  
            <div className="relative w-full sm:w-[165px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none block h-[44px] w-full rounded-[8px] border border-[#EAE5E0] bg-[#FFFFFF] py-[10px] pl-[14px] pr-[36px] text-[14px] font-medium text-[#242124] focus:border-[#781529] focus:outline-none focus:ring-1 focus:ring-[#781529] transition-colors cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[14px] text-[#77706D]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          <Link to="/products/new" className="shrink-0">
            <button className="flex items-center justify-center w-full sm:w-auto h-[44px] bg-[#781529] hover:bg-[#601020] text-white rounded-[8px] font-semibold text-[14px] gap-[8px] px-[20px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/50">
              <Plus size={16} />
              Add Product
            </button>
          </Link>
        </div>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-text-secondary border-b border-border">
                <tr>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Product</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">SKU</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Category</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Purchase Price</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Selling Price</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Stock</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase">Status</th>
                  <th className="px-[20px] py-[12px] font-semibold text-[12px] text-[#77706D] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E0] bg-[#FFFFFF]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-[20px] py-[32px] text-center text-[#77706D] text-[13px]">
                      Loading products...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-[20px] py-[32px] text-center text-[#77706D] text-[13px]">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  data.map((product) => {
                    const productCategory = categories.find((c) => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="transition-colors hover:bg-[#FDFCF9] group">
                        <td className="px-[20px] py-[12px] h-[64px]">
                          <div className="flex items-center gap-[12px]">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-[36px] w-[36px] rounded-[6px] object-cover border border-[#EAE5E0]" />
                            ) : (
                              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[6px] bg-[#F5EFE6] font-semibold text-[#781529] text-[14px]">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-[#242124] text-[14px] leading-tight">{product.name}</span>
                              <span className="text-[12px] text-[#77706D] mt-[2px] sm:hidden block">{product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-[20px] py-[12px] text-[#77706D] text-[13px] hidden sm:table-cell">{product.sku}</td>
                        <td className="px-[20px] py-[12px] text-[#77706D] text-[13px]">{productCategory ? productCategory.name : "Uncategorized"}</td>
                        <td className="px-[20px] py-[12px] text-[#77706D] text-[13px]">{formatCurrency(product.purchasePrice)}</td>
                        <td className="px-[20px] py-[12px] text-[#242124] font-medium text-[13px]">{formatCurrency(product.finalPrice)}</td>
                        <td className="px-[20px] py-[12px]">
                          <span className={`text-[13px] font-medium ${product.currentStock <= product.lowStockThreshold ? 'text-[#D97706]' : 'text-[#059669]'}`}>
                            {product.currentStock.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-[20px] py-[12px]">
                          <div className={`inline-flex items-center px-[8px] py-[2px] rounded-full text-[12px] font-medium ${
                            product.status === "IN_STOCK" ? "bg-[#059669]/10 text-[#059669]" : 
                            product.status === "LOW_STOCK" ? "bg-[#D97706]/10 text-[#D97706]" : 
                            "bg-[#DC2626]/10 text-[#DC2626]"
                          }`}>
                            {product.status.replace("_", " ")}
                          </div>
                        </td>
                        <td className="px-[20px] py-[12px] text-right relative">
                          <button 
                            onClick={(e) => openActionMenu(e, product.id, product.name)}
                            className="flex h-[36px] w-[36px] items-center justify-center rounded-[9px] text-[#77706D] hover:bg-[#F5E8EC] hover:text-[#7A1830] transition-colors outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-1 ml-auto"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <DeleteProductModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={confirmDelete}
        productName={deleteProduct?.name || ""}
        isDeleting={isDeleting}
      />

      {actionMenu && createPortal(
        <div 
          className="fixed z-[100] w-[184px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[12px] p-[6px] shadow-[0_10px_30px_rgba(36,33,36,0.12)]"
          style={{ top: actionMenu.top, right: actionMenu.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              navigate(`/products/edit/${actionMenu.id}`);
              setActionMenu(null);
            }}
            className="flex items-center w-full h-[42px] px-[12px] mb-[2px] rounded-[8px] hover:bg-[#F5E8EC] group transition-colors outline-none focus:ring-2 focus:ring-[#7A1830]"
          >
            <Edit className="w-[17px] h-[17px] text-[#77706D] group-hover:text-[#7A1830]" />
            <span className="ml-[10px] text-[14px] font-medium text-[#242124]">Edit Product</span>
          </button>
          <button
            onClick={() => {
              setDeleteProduct({ id: actionMenu.id, name: actionMenu.name });
              setActionMenu(null);
            }}
            className="flex items-center w-full h-[42px] px-[12px] rounded-[8px] hover:bg-[#FEF2F2] transition-colors outline-none focus:ring-2 focus:ring-[#DC2626]"
          >
            <Trash2 className="w-[17px] h-[17px] text-[#DC2626]" />
            <span className="ml-[10px] text-[14px] font-medium text-[#DC2626]">Delete Product</span>
          </button>
        </div>,
        document.body
      )}
    </PageContainer>
  );
}
