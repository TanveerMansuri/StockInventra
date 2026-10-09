import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { SearchInput } from "../../components/common/SearchInput";
import { 
  Select, 
  Card, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Badge
} from "@stock-inventra/ui";
import { useInventory } from "../../hooks/useInventory";

export function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useInventory({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(searchQuery);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "IN_STOCK": return "success";
      case "LOW_STOCK": return "warning";
      case "OUT_OF_STOCK": return "danger";
      default: return "neutral";
    }
  };

  return (
    <PageContainer
      title="Inventory"
      description="Track your stock levels and movements."
    >
      <Card className="flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-16 border-b border-border p-24 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <SearchInput 
              placeholder="Search inventory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <div className="flex flex-col gap-16 sm:flex-row sm:items-center">
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
              options={[
                { label: "All Status", value: "all" },
                { label: "In Stock", value: "IN_STOCK" },
                { label: "Low Stock", value: "LOW_STOCK" },
                { label: "Out of Stock", value: "OUT_OF_STOCK" },
              ]} 
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min. Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-text-secondary">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-text-secondary">No inventory found.</TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-12">
                      <div className="flex h-32 w-32 items-center justify-center rounded-md bg-background text-lg font-medium text-text-secondary">
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.currentStock}</TableCell>
                  <TableCell>{item.lowStockThreshold}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
