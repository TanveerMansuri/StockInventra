import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  constructor(private service: DashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = req.query.period as string || "thisMonth";
      const result = await this.service.getDashboardData(period);
      res.json({ success: true, data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };
}

export function createDashboardRouter(controller: DashboardController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  router.get("/", controller.getDashboard);
  return router;
}
