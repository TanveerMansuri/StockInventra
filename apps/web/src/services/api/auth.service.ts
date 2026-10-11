import { apiClient } from "./apiClient";
import { UserProfile } from "@stock-inventra/types";

export const authService = {
  login: (data: any) => 
    apiClient.post<{ success: boolean; data: UserProfile; message: string }>("/auth/login", data),
    
  logout: () => 
    apiClient.post<{ success: boolean; message: string }>("/auth/logout"),
    
  me: () => 
    apiClient.get<{ success: boolean; data: UserProfile }>("/auth/me"),

  changePassword: (data: any) =>
    apiClient.post<any>("/auth/change-password", data),
};
