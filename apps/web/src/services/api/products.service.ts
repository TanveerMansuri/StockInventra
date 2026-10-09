import { apiClient } from "./apiClient";
import { Product, PaginatedResponse } from "@stock-inventra/types";

export const productsService = {
  getProducts: (params?: any) => 
    apiClient.get<PaginatedResponse<Product>>("/products", { params }),
    
  getProduct: (id: string) => 
    apiClient.get<{ success: boolean; data: Product; message?: string }>(`/products/${id}`),
    
  createProduct: (data: any) => 
    apiClient.post<{ success: boolean; data: Product; message?: string }>("/products", data),
    
  updateProduct: (id: string, data: any) => 
    apiClient.patch<{ success: boolean; data: Product; message?: string }>(`/products/${id}`, data),
    
  deleteProduct: (id: string) => 
    apiClient.delete<{ success: boolean; message?: string }>(`/products/${id}`),
};
