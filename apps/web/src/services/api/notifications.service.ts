import { apiClient } from "./apiClient";

export const notificationsService = {
  getNotifications: async () => {
    return apiClient.get("/notifications");
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },

  markAllAsRead: async () => {
    return apiClient.patch("/notifications/read-all", {});
  },
};
