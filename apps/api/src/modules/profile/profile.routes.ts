import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { RequestHandler } from "express";

export function createProfileRouter(
  profileController: ProfileController,
  requireAuth: RequestHandler
) {
  const router = Router();

  router.use(requireAuth);
  router.get("/", profileController.getProfile);
  router.patch("/", profileController.updateProfile);

  return router;
}
