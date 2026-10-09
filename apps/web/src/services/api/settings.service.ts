import { apiClient } from "./apiClient";
import { AppSettings } from "@stock-inventra/types";

export const settingsService = {
  getSettings: () => 
    apiClient.get<{ success: boolean; data: AppSettings }>("/settings"),
    
  updateSettings: (data: any) => 
    apiClient.patch<{ success: boolean; data: AppSettings }>("/settings", data),
};
