import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAnalytics(req.query);
      res.json({ success: true, data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };
}

export function createAnalyticsRouter(controller: AnalyticsController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  router.get("/", controller.getAnalytics);
  return router;
}
