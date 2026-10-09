import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { SaleService } from "./sale.service";

export class SaleController {
  constructor(private service: SaleService) {}

  findMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findMany(req.query);
      res.json({ success: true, ...result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findById(req.params.id);
      res.json({ success: true, data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createSale(req.body);
      res.status(201).json({ success: true, data: result, message: "Sale created" });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.cancelSale(req.params.id);
      res.json({ success: true, data: null, message: "Sale cancelled" });
    } catch (error) {
      next(error);
    }
  };
}

export function createSaleRouter(controller: SaleController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  
  router.get("/", controller.findMany);
  router.get("/:id", controller.findById);
  router.post("/", controller.create);
  router.post("/:id/cancel", controller.cancel);

  return router;
}
