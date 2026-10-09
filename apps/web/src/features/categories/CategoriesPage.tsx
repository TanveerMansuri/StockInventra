import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { SearchInput } from "../../components/common/SearchInput";
import { 
  Button, 
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
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { categoriesService } from "../../services/api";

export function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const { data, isLoading, refetch } = useCategories({
    search: debouncedSearch || undefined,
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(searchQuery);
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt("Category Name:");
    if (!name) return;
    try {
      const res = await categoriesService.createCategory({ name, status: "ACTIVE" });
      if (res.success) {
        refetch();
      } else {
        alert(res.message || "Failed to add category");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await categoriesService.deleteCategory(id);
        if (res.success) {
          refetch();
        } else {
          alert(res.message || "Failed to delete");
        }
      } catch (err: any) {
        alert(err.message || "An error occurred");
      }
    }
  };

  return (
    <PageContainer
      title="Categories"
      description="Manage product categories."
      action={
        <Button variant="primary" onClick={handleAddCategory}>
          <Plus className="mr-8 h-18 w-18" />
          Add Category
        </Button>
      }
    >
      <Card className="flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-16 border-b border-border p-24 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <SearchInput 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Product Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-text-secondary">Loading...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-text-secondary">No categories found.</TableCell>
              </TableRow>
            ) : (
              data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell>
                    <Badge variant={category.status === "ACTIVE" ? "success" : "neutral"}>{category.status}</Badge>
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
                        { id: "edit", label: "Edit", icon: <Pencil /> },
                        { 
                          id: "delete", 
                          label: "Delete", 
                          icon: <Trash2 className="text-semantic-error" />,
                          onClick: () => handleDelete(category.id)
                        }
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
