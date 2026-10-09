import { Request, Response, NextFunction, Router, RequestHandler } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  constructor(private service: CategoryService) {}

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
      const result = await this.service.create(req.body);
      res.status(201).json({ success: true, data: result, message: "Category created" });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: result, message: "Category updated" });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      res.json({ success: true, data: null, message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export function createCategoryRouter(controller: CategoryController, requireAuth: RequestHandler) {
  const router = Router();
  router.use(requireAuth);
  
  router.get("/", controller.findMany);
  router.get("/:id", controller.findById);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
