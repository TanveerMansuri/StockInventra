import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, Trash2, Edit } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Input, Select, Badge, Card } from "@stock-inventra/ui";
import { useProducts } from "../../hooks/useProducts";
import { productsService } from "../../services/api";

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await productsService.deleteProduct(id);
        if (res.success) {
          refetch();
        } else {
          alert("Could not delete product");
        }
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  return (
    <PageContainer
      title="Products"
      description="Manage your product catalog, pricing, and details."
      action={
        <Link to="/products/new">
          <Button variant="primary" className="gap-8">
            <Plus size={16} />
            Add Product
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-24">
        {/* Filters and Search */}
        <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-16 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none text-text-secondary">
                <Search size={16} />
              </div>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-36"
              />
            </div>
            
            <div className="flex w-full gap-16 sm:w-auto">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { label: "All Categories", value: "all" },
                  { label: "Electronics", value: "cmuzdvb84000110abyyv9f7k9" }, // Minimal hardcoded test ID
                ]}
                className="w-full sm:w-48"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "In Stock", value: "IN_STOCK" },
                  { label: "Low Stock", value: "LOW_STOCK" },
                  { label: "Out of Stock", value: "OUT_OF_STOCK" },
                ]}
                className="w-full sm:w-48"
              />
            </div>
          </div>
          
          <Button variant="outline" className="gap-8 md:w-auto">
            <Filter size={16} />
            More Filters
          </Button>
        </div>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-text-secondary border-b border-border">
                <tr>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase">Product</th>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase">SKU</th>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase">Price</th>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase">Stock</th>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase">Status</th>
                  <th className="px-[16px] py-[10px] font-semibold text-[12px] tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[32px] text-center text-text-secondary">
                      Loading products...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-[16px] py-[32px] text-center text-text-secondary">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  data.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-background/50">
                      <td className="px-[16px] py-[12px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-md bg-background font-medium text-text-secondary text-[12px]">
                            {product.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-text-primary text-[13px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[12px] text-text-secondary text-[13px]">{product.sku}</td>
                      <td className="px-[16px] py-[12px] text-text-primary font-semibold text-[13px]">₹{product.finalPrice.toLocaleString()}</td>
                      <td className="px-[16px] py-[12px] text-text-secondary text-[13px]">{product.currentStock}</td>
                      <td className="px-[16px] py-[12px]">
                        <Badge 
                          variant={product.status === "IN_STOCK" ? "success" : product.status === "LOW_STOCK" ? "warning" : "danger"}
                        >
                          {product.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-[16px] py-[12px] text-right">
                        <div className="flex items-center justify-end gap-[8px]">
                          <Button variant="ghost" className="h-[28px] w-[28px] p-0 text-text-secondary hover:text-primary">
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleDelete(product.id)}
                            className="h-[28px] w-[28px] p-0 text-text-secondary hover:text-semantic-error"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
