import { StockMovementRepository, InventoryRepository } from "../../modules/inventory/inventory.repository";
import { StockMovement, InventoryItem, Product } from "@stock-inventra/types";
import { prisma } from "../prisma";
import { MovementType, ProductStatus } from "@prisma/client";

export class PrismaStockMovementRepository implements StockMovementRepository {
  async findMany(filters: any, tx?: any): Promise<StockMovement[]> {
    const client = tx || prisma;
    const where: any = {};
    if (filters.productId) {
      where.productId = filters.productId;
    }
    const movements = await client.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    return movements.map((m: any) => ({
      ...m,
      type: m.type as "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN",
      createdAt: m.createdAt.toISOString()
    }));
  }

  async create(data: Omit<StockMovement, "id" | "createdAt">, tx?: any): Promise<StockMovement> {
    const client = tx || prisma;
    const movement = await client.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type as MovementType,
        quantity: data.quantity,
        referenceId: data.referenceId,
        note: data.note,
      }
    });
    return {
      ...movement,
      type: movement.type as "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN",
      createdAt: movement.createdAt.toISOString()
    };
  }
}

export class PrismaInventoryRepository implements InventoryRepository {
  // Inventory view is usually calculated by SQL queries or by relying on Product currentStock 
  // plus aggregating movements. For simplicity, we calculate it dynamically here.
  
  private async calculateItem(product: any, client: any): Promise<InventoryItem> {
    const movements = await client.stockMovement.findMany({
      where: { productId: product.id }
    });
    
    let stockIn = product.initialStock;
    let sold = 0;
    
    for (const mov of movements) {
      if (mov.type === "PURCHASE" || mov.type === "RETURN") {
        stockIn += mov.quantity;
      } else if (mov.type === "SALE") {
        sold += mov.quantity;
      } else if (mov.type === "ADJUSTMENT") {
        if (mov.quantity > 0) stockIn += mov.quantity;
        else sold += Math.abs(mov.quantity);
      }
    }
    
    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice.toNumber(),
        marginPercent: product.marginPercent.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
        discountPercent: product.discountPercent.toNumber(),
        finalPrice: product.finalPrice.toNumber(),
        initialStock: product.initialStock,
        currentStock: product.currentStock,
        lowStockThreshold: product.lowStockThreshold,
        status: product.status as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK",
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      stockIn,
      sold,
      currentStock: product.currentStock,
      minimumStock: product.lowStockThreshold,
      status: product.status,
      lastUpdated: product.updatedAt.toISOString(),
    };
  }

  async getInventory(filters: any, tx?: any): Promise<InventoryItem[]> {
    const client = tx || prisma;
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } }
      ];
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.status) {
      where.status = filters.status as ProductStatus;
    }
    
    const products = await client.product.findMany({ where });
    
    const items = await Promise.all(products.map((p: any) => this.calculateItem(p, client)));
    return items;
  }

  async getInventoryItem(productId: string, tx?: any): Promise<InventoryItem | null> {
    const client = tx || prisma;
    const product = await client.product.findUnique({ where: { id: productId } });
    if (!product) return null;
    return this.calculateItem(product, client);
  }
}
