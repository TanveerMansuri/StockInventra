import { CategoryRepository } from "./category.repository";
import { createCategorySchema, updateCategorySchema, paginationQuerySchema } from "@stock-inventra/validation";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { paginate } from "../../utils/pagination";

export class CategoryService {
  constructor(private repo: CategoryRepository) {}

  async findMany(query: unknown) {
    const validQuery = paginationQuerySchema.parse(query);
    const items = await this.repo.findMany(query);
    return paginate(items, validQuery.page, validQuery.limit);
  }

  async findById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError("Category not found");
    return category;
  }

  async create(data: unknown) {
    const valid = createCategorySchema.parse(data);
    
    const existing = await this.repo.findByName(valid.name);
    if (existing) {
      throw new ConflictError("Category name already exists");
    }

    return this.repo.create(valid);
  }

  async update(id: string, data: unknown) {
    const category = await this.findById(id);
    const valid = updateCategorySchema.parse(data);

    if (valid.name && valid.name !== category.name) {
      const existing = await this.repo.findByName(valid.name);
      if (existing) throw new ConflictError("Category name already exists");
    }

    return this.repo.update(id, valid);
  }

  async delete(id: string) {
    const category = await this.findById(id);
    const productCount = await this.repo.countProducts(id);
    
    if (productCount > 0) {
      throw new ConflictError("Cannot delete category containing products");
    }

    await this.repo.delete(id);
  }
}
