import { Product } from "@stock-inventra/types";

export interface ProductRepository {
  findMany(filters: any, tx?: any): Promise<Product[]>;
  findById(id: string, tx?: any): Promise<Product | null>;
  findBySku(sku: string, tx?: any): Promise<Product | null>;
  create(data: Omit<Product, "id" | "createdAt" | "updatedAt">, tx?: any): Promise<Product>;
  update(id: string, data: Partial<Product>, tx?: any): Promise<Product>;
  delete(id: string, tx?: any): Promise<void>;
}
