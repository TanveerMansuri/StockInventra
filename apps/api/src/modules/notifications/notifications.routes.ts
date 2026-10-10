import { Router, RequestHandler } from "express";
import { NotificationController } from "./notifications.controller";

export function createNotificationRouter(
  controller: NotificationController,
  requireAuth: RequestHandler
) {
  const router = Router();

  router.use(requireAuth);
  router.get("/", controller.getNotifications);
  router.patch("/read-all", controller.markAllAsRead);
  router.patch("/:id/read", controller.markAsRead);

  return router;
}
