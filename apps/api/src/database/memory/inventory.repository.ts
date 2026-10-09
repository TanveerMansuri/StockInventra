import { StockMovementRepository, InventoryRepository } from "../../modules/inventory/inventory.repository";
import { StockMovement, InventoryItem, Product } from "@stock-inventra/types";
import { memoryDb } from "./db";

export class MemoryStockMovementRepository implements StockMovementRepository {
  async findMany(filters: any): Promise<StockMovement[]> {
    let movements = Array.from(memoryDb.movements.values());
    if (filters.productId) {
      movements = movements.filter(m => m.productId === filters.productId);
    }
    movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return movements;
  }

  async create(data: Omit<StockMovement, "id" | "createdAt">): Promise<StockMovement> {
    const id = "MOV-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const movement: StockMovement = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    memoryDb.movements.set(id, movement);
    return movement;
  }
}

export class MemoryInventoryRepository implements InventoryRepository {
  private calculateItem(product: Product): InventoryItem {
    let stockIn = product.initialStock;
    let sold = 0;
    
    for (const mov of memoryDb.movements.values()) {
      if (mov.productId === product.id) {
        if (mov.type === "PURCHASE" || mov.type === "RETURN") {
          stockIn += mov.quantity;
        } else if (mov.type === "SALE") {
          sold += mov.quantity;
        } else if (mov.type === "ADJUSTMENT") {
          if (mov.quantity > 0) stockIn += mov.quantity;
          else sold += Math.abs(mov.quantity); // Count negative adjustments as outgoing
        }
      }
    }
    
    return {
      product,
      stockIn,
      sold,
      currentStock: product.currentStock,
      minimumStock: product.lowStockThreshold,
      status: product.status,
      lastUpdated: product.updatedAt,
    };
  }

  async getInventory(filters: any): Promise<InventoryItem[]> {
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
    
    return products.map(p => this.calculateItem(p));
  }

  async getInventoryItem(productId: string): Promise<InventoryItem | null> {
    const product = memoryDb.products.get(productId);
    if (!product) return null;
    return this.calculateItem(product);
  }
}
