import { apiClient } from "./apiClient";
import { Category, PaginatedResponse } from "@stock-inventra/types";

export const categoriesService = {
  getCategories: (params?: any) => 
    apiClient.get<PaginatedResponse<Category>>("/categories", { params }),
    
  createCategory: (data: any) => 
    apiClient.post<{ success: boolean; data: Category; message?: string }>("/categories", data),
    
  updateCategory: (id: string, data: any) => 
    apiClient.patch<{ success: boolean; data: Category; message?: string }>(`/categories/${id}`, data),
    
  deleteCategory: (id: string) => 
    apiClient.delete<{ success: boolean; message?: string }>(`/categories/${id}`),
};
