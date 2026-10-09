import { apiClient } from "./apiClient";

export const analyticsService = {
  getAnalytics: (params?: any) => 
    apiClient.get<{ success: boolean; data: any }>("/analytics", { params }),
};
