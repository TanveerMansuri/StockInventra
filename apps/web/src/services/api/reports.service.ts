import { apiClient } from "./apiClient";

export const reportsService = {
  getGeneral: () => apiClient.get<{ success: boolean; data: any }>("/reports"),
  getSales: () => apiClient.get<{ success: boolean; data: any }>("/reports/sales"),
  getProfit: () => apiClient.get<{ success: boolean; data: any }>("/reports/profit"),
  getInventory: () => apiClient.get<{ success: boolean; data: any }>("/reports/inventory"),
  getProducts: () => apiClient.get<{ success: boolean; data: any }>("/reports/products"),
};
