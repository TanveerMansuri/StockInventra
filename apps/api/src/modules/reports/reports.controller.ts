import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { ReportsService } from "./reports.service";

export class ReportsController {
  constructor(private service: ReportsService) {}
  
  getGeneral = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, data: { reportType: "General" }, message: "Success" });
  };

  private async handleReport(req: Request, res: Response, next: NextFunction, getReport: (query: any) => Promise<any>, type: string) {
    try {
      const isCsv = req.query.format === 'csv';
      const report = await getReport(req.query);
      
      if (isCsv) {
        const csv = this.service.generateCsv(report.details);
        res.header('Content-Type', 'text/csv');
        res.attachment(`stock-inventra-${type}-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json({ success: true, data: report, message: "Success" });
      }
    } catch (error) {
      next(error);
    }
  }

  getSales = async (req: Request, res: Response, next: NextFunction) => {
    this.handleReport(req, res, next, (q) => this.service.getSalesReport(q), "sales");
  };

  getProfit = async (req: Request, res: Response, next: NextFunction) => {
    this.handleReport(req, res, next, (q) => this.service.getProfitReport(q), "profit");
  };

  getInventory = async (req: Request, res: Response, next: NextFunction) => {
    this.handleReport(req, res, next, (q) => this.service.getInventoryReport(q), "inventory");
  };

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    this.handleReport(req, res, next, (q) => this.service.getProductPerformanceReport(q), "product-performance");
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
