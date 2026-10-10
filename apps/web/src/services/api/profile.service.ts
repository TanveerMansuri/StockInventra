import { apiClient } from "./apiClient";

export const profileService = {
  getProfile: async () => {
    return apiClient.get("/profile");
  },

  updateProfile: async (data: { name?: string; avatar?: string | null }) => {
    return apiClient.patch("/profile", data);
  },

  uploadAvatar: async (formData: FormData) => {
    return apiClient.post("/profile/upload-avatar", formData);
  }
};
