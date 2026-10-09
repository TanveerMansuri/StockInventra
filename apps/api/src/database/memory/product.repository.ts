import { ProductRepository } from "../../modules/products/product.repository";
import { Product } from "@stock-inventra/types";
import { memoryDb } from "./db";

export class MemoryProductRepository implements ProductRepository {
  async findMany(filters: any): Promise<Product[]> {
    let products = Array.from(memoryDb.products.values());

    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filters.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.status) {
      products = products.filter(p => p.status === filters.status);
    }

    if (filters.sortBy) {
      products.sort((a: any, b: any) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];
        if (aVal < bVal) return filters.sortOrder === "desc" ? 1 : -1;
        if (aVal > bVal) return filters.sortOrder === "desc" ? -1 : 1;
        return 0;
      });
    } else {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    return memoryDb.products.get(id) || null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    for (const p of memoryDb.products.values()) {
      if (p.sku === sku) return p;
    }
    return null;
  }

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const id = "PROD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const product: Product = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.products.set(id, product);
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = memoryDb.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updated = { ...product, ...data, updatedAt: new Date().toISOString() };
    memoryDb.products.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    memoryDb.products.delete(id);
  }
}
