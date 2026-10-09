import { CategoryRepository } from "../../modules/categories/category.repository";
import { Category } from "@stock-inventra/types";
import { memoryDb } from "./db";

export class MemoryCategoryRepository implements CategoryRepository {
  async findMany(filters: any): Promise<Category[]> {
    let categories = Array.from(memoryDb.categories.values());

    if (filters.search) {
      const q = filters.search.toLowerCase();
      categories = categories.filter(c => c.name.toLowerCase().includes(q));
    }
    if (filters.status) {
      categories = categories.filter(c => c.status === filters.status);
    }
    
    // Calculate accurate product counts
    for (const cat of categories) {
      cat.productCount = await this.countProducts(cat.id);
    }

    return categories;
  }

  async findById(id: string): Promise<Category | null> {
    const category = memoryDb.categories.get(id);
    if (category) {
      category.productCount = await this.countProducts(category.id);
    }
    return category || null;
  }

  async findByName(name: string): Promise<Category | null> {
    for (const c of memoryDb.categories.values()) {
      if (c.name.toLowerCase() === name.toLowerCase()) return c;
    }
    return null;
  }

  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">): Promise<Category> {
    const id = "CAT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const category: Category = {
      ...data,
      id,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.categories.set(id, category);
    return category;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = memoryDb.categories.get(id);
    if (!category) throw new Error("Category not found");
    
    const updated = { ...category, ...data, updatedAt: new Date().toISOString() };
    memoryDb.categories.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    memoryDb.categories.delete(id);
  }

  async countProducts(id: string): Promise<number> {
    let count = 0;
    for (const p of memoryDb.products.values()) {
      if (p.categoryId === id) count++;
    }
    return count;
  }
}
