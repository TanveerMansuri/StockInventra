import { StockMovementRepository, InventoryRepository } from "./inventory.repository";
import { ProductRepository } from "../products/product.repository";
import { ProductPricingService } from "../products/product-pricing.service";
import { inventoryAdjustmentSchema, paginationQuerySchema } from "@stock-inventra/validation";
import { NotFoundError, BusinessRuleError } from "../../utils/errors";
import { MovementType } from "@stock-inventra/types";
import { paginate } from "../../utils/pagination";

export class InventoryService {
  constructor(
    private invRepo: InventoryRepository,
    private movRepo: StockMovementRepository,
    private prodRepo: ProductRepository,
    private pricingService: ProductPricingService
  ) {}

  async getInventory(query: unknown) {
    const validQuery = paginationQuerySchema.parse(query);
    const items = await this.invRepo.getInventory(query);
    return paginate(items, validQuery.page, validQuery.limit);
  }

  async getInventoryItem(productId: string) {
    const item = await this.invRepo.getInventoryItem(productId);
    if (!item) throw new NotFoundError("Product not found");
    return item;
  }

  async getMovements(query: unknown) {
    const validQuery = paginationQuerySchema.parse(query);
    const items = await this.movRepo.findMany(query);
    return paginate(items, validQuery.page, validQuery.limit);
  }

  async adjustStock(data: unknown) {
    const valid = inventoryAdjustmentSchema.parse(data);
    
    return this.modifyStock(
      valid.productId, 
      valid.type, 
      valid.quantity, 
      undefined, 
      valid.note
    );
  }

  // The single entry point for all stock modification (Purchase, Sale, Return, Adjustment)
  async modifyStock(
    productId: string, 
    type: MovementType, 
    quantity: number, 
    referenceId?: string, 
    note?: string,
    tx?: any
  ) {
    const product = await this.prodRepo.findById(productId, tx);
    if (!product) throw new NotFoundError("Product not found");

    let netChange = quantity;
    if (type === "SALE") {
      netChange = -Math.abs(quantity);
    } else if (type === "PURCHASE" || type === "RETURN") {
      netChange = Math.abs(quantity);
    }

    const newStock = Math.round((product.currentStock + netChange) * 1000) / 1000;
    if (newStock < 0) {
      throw new BusinessRuleError("Insufficient stock");
    }

    await this.movRepo.create({
      productId,
      type,
      quantity: netChange,
      referenceId,
      note,
    }, tx);

    const newStatus = this.pricingService.determineStatus(newStock, product.lowStockThreshold);
    await this.prodRepo.update(productId, {
      currentStock: newStock,
      status: newStatus
    }, tx);

    return { success: true, newStock };
  }
}
