import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { RequestHandler } from "express";
import { uploadAvatar } from "../../utils/upload";

export function createProfileRouter(
  profileController: ProfileController,
  requireAuth: RequestHandler
) {
  const router = Router();

  router.use(requireAuth);
  router.get("/", profileController.getProfile);
  router.patch("/", profileController.updateProfile);
  router.post("/upload-avatar", uploadAvatar.single("avatar") as any, profileController.uploadAvatar);
  return router;
}
