import { apiClient } from "./apiClient";

export const dashboardService = {
  getDashboardData: (period: string = "thisMonth") => 
    apiClient.get<{ success: boolean; data: any }>("/dashboard", { params: { period } }),
};
