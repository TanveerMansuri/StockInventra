import { StockMovement, InventoryItem } from "@stock-inventra/types";

export interface StockMovementRepository {
  findMany(filters: any, tx?: any): Promise<StockMovement[]>;
  create(data: Omit<StockMovement, "id" | "createdAt">, tx?: any): Promise<StockMovement>;
}

export interface InventoryRepository {
  getInventory(filters: any): Promise<InventoryItem[]>;
  getInventoryItem(productId: string): Promise<InventoryItem | null>;
}
