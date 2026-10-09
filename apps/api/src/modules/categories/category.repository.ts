import { Category } from "@stock-inventra/types";

export interface CategoryRepository {
  findMany(filters: any): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">): Promise<Category>;
  update(id: string, data: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
  countProducts(id: string): Promise<number>;
}
