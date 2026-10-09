import { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { SearchInput } from "../../components/common/SearchInput";
import { 
  Button, 
  Select, 
  Card, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Badge,
  Dropdown
} from "@stock-inventra/ui";
import { Plus, MoreHorizontal, Receipt, XCircle } from "lucide-react";
import { useSales } from "../../hooks/useSales";
import { salesService } from "../../services/api";

export function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useSales({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(searchQuery);
    }
  };

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

  return (
    <PageContainer
      title="Sales"
      description="View and manage sales history."
      action={
        <Link to="/sales/new">
          <Button variant="primary">
            <Plus className="mr-8 h-18 w-18" />
            New Sale
          </Button>
        </Link>
      }
    >
      <Card className="flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-16 border-b border-border p-24 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <SearchInput 
              placeholder="Search sales by ID or product..." 
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
                { label: "Completed", value: "COMPLETED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]} 
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-text-secondary">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-text-secondary">No sales found.</TableCell>
              </TableRow>
            ) : (
              data.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium text-xs font-mono">{sale.id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell className="text-text-secondary">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₹{sale.subtotal}</TableCell>
                  <TableCell className="text-semantic-error">₹{sale.discount}</TableCell>
                  <TableCell className="font-medium">₹{sale.finalAmount}</TableCell>
                  <TableCell className="text-semantic-success">₹{sale.grossProfit}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "COMPLETED" ? "success" : "neutral"}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <Button variant="ghost" className="h-32 w-32 p-0 rounded-full">
                          <MoreHorizontal className="h-16 w-16" />
                        </Button>
                      }
                      items={[
                        { id: "view", label: "View Receipt", icon: <Receipt /> },
                        ...(sale.status === "COMPLETED" ? [
                          { 
                            id: "cancel", 
                            label: "Cancel Sale", 
                            icon: <XCircle className="text-semantic-error" />,
                            onClick: () => handleCancelSale(sale.id)
                          }
                        ] : [])
                      ]}
                    />
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
