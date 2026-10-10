import { Router } from "express";
import { AuthController } from "./auth.controller";
import { RequestHandler } from "express";

export function createAuthRouter(
  authController: AuthController,
  requireAuth: RequestHandler
) {
  const router = Router();

  router.post("/login", authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", requireAuth, authController.me);
  router.post("/change-password", requireAuth, authController.changePassword);
  router.post("/forgot-password", authController.forgotPassword);
  router.post("/reset-password", authController.resetPassword);

  return router;
}
