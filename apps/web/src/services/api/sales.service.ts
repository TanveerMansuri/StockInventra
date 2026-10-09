import { apiClient } from "./apiClient";
import { Sale, PaginatedResponse } from "@stock-inventra/types";

export const salesService = {
  getSales: (params?: any) => 
    apiClient.get<PaginatedResponse<Sale>>("/sales", { params }),
    
  getSale: (id: string) => 
    apiClient.get<{ success: boolean; data: Sale; message?: string }>(`/sales/${id}`),
    
  createSale: (data: any) => 
    apiClient.post<{ success: boolean; data: Sale; message?: string }>("/sales", data),
    
  cancelSale: (id: string) => 
    apiClient.post<{ success: boolean; message?: string }>(`/sales/${id}/cancel`),
};
