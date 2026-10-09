import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { InventoryService } from "./inventory.service";

export class InventoryController {
  constructor(private service: InventoryService) {}

  getInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getInventory(req.query);
      res.json({ success: true, ...result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  getInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getInventoryItem(req.params.productId);
      res.json({ success: true, data: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  getMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getMovements(req.query);
      res.json({ success: true, ...result, message: "Success" });
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.adjustStock(req.body);
      res.json({ success: true, data: null, message: "Stock adjusted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export function createInventoryRouter(controller: InventoryController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  
  router.get("/", controller.getInventory);
  router.get("/movements", controller.getMovements);
  router.get("/:productId", controller.getInventoryItem);
  router.post("/adjustments", controller.adjustStock);

  return router;
}
