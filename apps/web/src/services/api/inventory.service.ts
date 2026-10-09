import { apiClient } from "./apiClient";
import { InventoryItem, StockMovement, PaginatedResponse } from "@stock-inventra/types";

export const inventoryService = {
  getInventory: (params?: any) => 
    apiClient.get<PaginatedResponse<InventoryItem>>("/inventory", { params }),
    
  getMovements: (params?: any) => 
    apiClient.get<PaginatedResponse<StockMovement>>("/inventory/movements", { params }),
    
  adjustStock: (data: any) => 
    apiClient.post<{ success: boolean }>("/inventory/adjust", data),
};
