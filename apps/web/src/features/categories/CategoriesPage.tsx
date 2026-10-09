import { useState, useEffect } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { categoriesService } from "../../services/api";
import { CategoryModal } from "./CategoryModal";

export function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<{ id: string; name: string; status: string } | null>(null);
  
  const { data, isLoading, refetch } = useCategories({
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
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
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-[24px] lg:mb-[28px]">
        <div className="flex flex-col">
          <h1 className="text-[30px] lg:text-[32px] font-bold text-[#242124] leading-[38px] lg:leading-[40px]">Categories</h1>
          <p className="text-[14px] lg:text-[16px] text-[#77706D] mt-[4px] lg:mt-[6px]">Manage product categories.</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="mt-[16px] sm:mt-0 h-[44px] lg:h-[46px] px-[18px] lg:px-[20px] bg-[#7A1830] hover:bg-[#641326] text-white text-[14px] font-semibold rounded-[9px] lg:rounded-[10px] flex items-center justify-center gap-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830] focus:ring-offset-2"
        >
          <Plus className="w-[18px] h-[18px]" />
          Add Category
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#EAE5E0] rounded-[10px] lg:rounded-[12px] shadow-[0_2px_6px_rgba(36,33,36,0.04)] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center px-[16px] lg:px-[20px] py-[12px] lg:py-[15px] border-b border-[#EAE5E0]">
          <div className="relative w-full sm:w-[340px] lg:w-[380px] max-w-full">
            <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
              <Search className="w-[18px] h-[18px] text-[#8A817D]" />
            </div>
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] lg:h-[46px] pl-[40px] pr-[14px] border border-[#EAE5E0] rounded-[9px] bg-[#FFFFFF] text-[14px] text-[#242124] placeholder:text-[#8A817D] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830] transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FCFCFB] border-b border-[#EAE5E0]">
                <th className="h-[48px] lg:h-[52px] px-[16px] lg:px-[20px] text-[12px] lg:text-[13px] font-semibold text-[#77706D] uppercase tracking-[0.04em] align-middle w-[35%]">Category Name</th>
                <th className="h-[48px] lg:h-[52px] px-[16px] lg:px-[20px] text-[12px] lg:text-[13px] font-semibold text-[#77706D] uppercase tracking-[0.04em] align-middle w-[25%]">Product Count</th>
                <th className="h-[48px] lg:h-[52px] px-[16px] lg:px-[20px] text-[12px] lg:text-[13px] font-semibold text-[#77706D] uppercase tracking-[0.04em] align-middle w-[20%]">Status</th>
                <th className="h-[48px] lg:h-[52px] px-[16px] lg:px-[20px] text-[12px] lg:text-[13px] font-semibold text-[#77706D] uppercase tracking-[0.04em] align-middle text-right w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-[20px] py-[32px]">
                    <div className="flex flex-col gap-[16px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-[24px] bg-[#F1EEEB] rounded-[4px] animate-pulse w-full"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-[20px] py-[64px] text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-[48px] h-[48px] rounded-full bg-[#F5E9EC] flex items-center justify-center mb-[16px]">
                        <Search className="w-[24px] h-[24px] text-[#7A1830]" />
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#242124] mb-[4px]">
                        {searchQuery ? "No categories match your search." : "No categories yet"}
                      </h3>
                      <p className="text-[14px] text-[#77706D]">
                        {searchQuery ? "Try adjusting your search filters." : "Create your first category to organize products."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((category) => (
                  <tr key={category.id} className="border-b border-[#EAE5E0] last:border-b-0 hover:bg-[#FCF8F7] transition-colors">
                    <td className="h-[60px] lg:h-[64px] px-[16px] lg:px-[20px] align-middle">
                      <span className="text-[14px] font-semibold text-[#242124]">{category.name}</span>
                    </td>
                    <td className="h-[60px] lg:h-[64px] px-[16px] lg:px-[20px] align-middle">
                      <span className="text-[14px] text-[#4F4946]">{category.productCount}</span>
                    </td>
                    <td className="h-[60px] lg:h-[64px] px-[16px] lg:px-[20px] align-middle">
                      {category.status === "ACTIVE" ? (
                        <span className="inline-flex items-center px-[10px] lg:px-[12px] py-[5px] lg:py-[6px] rounded-full bg-[#E8F5EC] text-[#237A43] text-[11px] lg:text-[12px] font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-[10px] lg:px-[12px] py-[5px] lg:py-[6px] rounded-full bg-[#F1EEEB] text-[#77706D] text-[11px] lg:text-[12px] font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="h-[60px] lg:h-[64px] px-[16px] lg:px-[20px] align-middle text-right">
                      <div className="flex items-center justify-end gap-[8px]">
                        <button 
                          aria-label="Edit"
                          onClick={() => {
                            setCategoryToEdit({
                              id: category.id,
                              name: category.name,
                              status: category.status,
                            });
                            setIsModalOpen(true);
                          }}
                          className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] flex items-center justify-center rounded-[7px] lg:rounded-[8px] text-[#77706D] hover:bg-[#F5EFE6] hover:text-[#7A1830] transition-colors focus:outline-none"
                        >
                          <Pencil className="w-[16px] h-[16px]" />
                        </button>
                        <button 
                          aria-label="Delete"
                          onClick={() => handleDelete(category.id)}
                          className="w-[32px] h-[32px] lg:w-[36px] lg:h-[36px] flex items-center justify-center rounded-[7px] lg:rounded-[8px] text-[#77706D] hover:bg-[#FCE8E8] hover:text-[#DC2626] transition-colors focus:outline-none"
                        >
                          <Trash2 className="w-[16px] h-[16px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        categoryToEdit={categoryToEdit}
      />
    </PageContainer>
  );
}
