import { SaleRepository } from "./sale.repository";
import { InventoryService } from "../inventory/inventory.service";
import { ProductRepository } from "../products/product.repository";
import { createSaleSchema, paginationQuerySchema } from "@stock-inventra/validation";
import { NotFoundError, BusinessRuleError } from "../../utils/errors";
import { SaleItem } from "@stock-inventra/types";
import { paginate } from "../../utils/pagination";

import { NotificationService } from "../notifications/notifications.service";

export class SaleService {
  constructor(
    private saleRepo: SaleRepository,
    private inventoryService: InventoryService,
    private prodRepo: ProductRepository,
    private notificationService?: NotificationService
  ) {}

  async findMany(query: unknown) {
    const validQuery = paginationQuerySchema.parse(query);
    const items = await this.saleRepo.findMany(query);
    return paginate(items, validQuery.page, validQuery.limit);
  }

  async findById(id: string) {
    const sale = await this.saleRepo.findById(id);
    if (!sale) throw new NotFoundError("Sale not found");
    return sale;
  }

  async createSale(data: unknown) {
    const valid = createSaleSchema.parse(data);

    // Wrap the entire business flow in a transaction
    return this.saleRepo.executeTransaction!(async (tx) => {
      let totalSubtotal = 0;
      let totalDiscount = 0;
      let totalFinalAmount = 0;
      let totalCost = 0;
      
      const saleItems: SaleItem[] = [];

      for (const item of valid.items) {
        // Pass tx to repository lookup
        const product = await this.prodRepo.findById(item.productId, tx);
        if (!product) throw new NotFoundError(`Product ${item.productId} not found`);
        if (product.currentStock < item.quantity) {
          throw new BusinessRuleError(`Insufficient stock for product ${product.name}`);
        }

        // Authoritative pricing calculation
        const unitPrice = product.sellingPrice;
        const subtotal = unitPrice * item.quantity;
        const discountAmount = (subtotal * item.discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * (product.taxPercent || 0)) / 100;
        const finalAmount = taxableAmount + taxAmount;
        const cost = product.purchasePrice * item.quantity;

        totalSubtotal += subtotal;
        totalDiscount += discountAmount;
        totalFinalAmount += finalAmount;
        totalCost += cost;

        saleItems.push({
          id: "SI-" + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          discount: item.discount,
          finalAmount,
        });
      }

      const grossProfit = totalFinalAmount - totalCost;
      const profitMargin = totalFinalAmount > 0 ? (grossProfit / totalFinalAmount) * 100 : 0;

      // Pass tx to sale creation
      const sale = await this.saleRepo.create({
        subtotal: totalSubtotal,
        discount: totalDiscount,
        finalAmount: totalFinalAmount,
        totalCost,
        grossProfit,
        profitMargin,
        status: "COMPLETED",
        items: saleItems,
      }, tx);

      // Reduce inventory through single entry point, passing tx
      for (const item of saleItems) {
        await this.inventoryService.modifyStock(
          item.productId,
          "SALE",
          item.quantity,
          sale.id,
          "Automated sale deduction",
          tx
        );
      }
      
      return sale;
    });
  }

  async cancelSale(id: string) {
    return this.saleRepo.executeTransaction!(async (tx) => {
      const sale = await this.saleRepo.findById(id, tx);
      if (!sale) throw new NotFoundError("Sale not found");
      
      if (sale.status === "CANCELLED") {
        throw new BusinessRuleError("Sale is already cancelled");
      }

      // Restore inventory
      for (const item of sale.items) {
        await this.inventoryService.modifyStock(
          item.productId,
          "RETURN",
          item.quantity,
          sale.id,
          "Sale cancellation",
          tx
        );
      }

      await this.saleRepo.updateStatus(id, "CANCELLED", tx);
    });
  }
}
