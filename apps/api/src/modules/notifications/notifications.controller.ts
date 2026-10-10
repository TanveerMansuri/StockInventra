import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notifications.service";
import { AuthenticatedRequest } from "../../types";

export class NotificationController {
  constructor(private service: NotificationService) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await this.service.getNotifications(authReq.user.id);
      res.json({ success: true, data, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      await this.service.markAsRead(authReq.user.id, id);
      res.json({ success: true, data: null, message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      await this.service.markAllAsRead(authReq.user.id);
      res.json({ success: true, data: null, message: "All marked as read" });
    } catch (error) {
      next(error);
    }
  };
}
