import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { SettingsService } from "./settings.service";

export class SettingsController {
  constructor(private service: SettingsService) {}

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getSettings();
      res.json({ success: true, data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateSettings(req.body);
      res.json({ success: true, data: result, message: "Settings updated" });
    } catch (error) {
      next(error);
    }
  };
}

export function createSettingsRouter(controller: SettingsController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  
  router.get("/", controller.getSettings);
  router.patch("/", controller.updateSettings);

  return router;
}
