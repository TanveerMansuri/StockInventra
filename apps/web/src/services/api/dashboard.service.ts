import { apiClient } from "./apiClient";

export const dashboardService = {
  getDashboardData: (params: { period?: string; startDate?: string; endDate?: string } | string = "thisMonth") => {
    const queryParams = typeof params === "string" ? { period: params } : params;
    return apiClient.get<{ success: boolean; data: any }>("/dashboard", { params: queryParams });
  },
};
