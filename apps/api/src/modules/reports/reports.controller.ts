import { Request, Response, NextFunction, Router, RequestHandler } from "express";

export class ReportsController {
  
  getGeneral = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "General" }, message: "Success" });
  };

  getSales = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "Sales" }, message: "Success" });
  };

  getProfit = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "Profit" }, message: "Success" });
  };

  getInventory = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "Inventory" }, message: "Success" });
  };

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "Products" }, message: "Success" });
  };
}

export function createReportsRouter(controller: ReportsController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  
  router.get("/", controller.getGeneral);
  router.get("/sales", controller.getSales);
  router.get("/profit", controller.getProfit);
  router.get("/inventory", controller.getInventory);
  router.get("/products", controller.getProducts);

  return router;
}
