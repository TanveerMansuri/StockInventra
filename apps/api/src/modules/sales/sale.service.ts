import { SaleRepository } from "./sale.repository";
import { InventoryService } from "../inventory/inventory.service";
import { ProductRepository } from "../products/product.repository";
import { SettingsRepository } from "../settings/settings.repository";
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
    private settingsRepo?: SettingsRepository,
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
      // Determine tax rate to apply
      let configuredTaxRate = 0;
      if (valid.taxRate !== undefined) {
        configuredTaxRate = valid.taxRate;
      } else if (this.settingsRepo) {
        try {
          const settings = await this.settingsRepo.getSettings(tx);
          configuredTaxRate = settings.currency?.taxRate || 0;
        } catch {
          configuredTaxRate = 0;
        }
      }

      let totalSubtotal = 0;
      let totalPreTaxDiscount = 0;
      let totalTaxAmount = 0;
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
        const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
        
        // Item pre-tax discount (default discount or item discount)
        const discountPercent = item.discount || 0;
        const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
        const taxableAmount = Math.round((subtotal - discountAmount) * 100) / 100;
        
        // Item tax
        const itemTaxRate = configuredTaxRate;
        const itemTaxAmount = Math.round(taxableAmount * (itemTaxRate / 100) * 100) / 100;
        const finalAmount = Math.round((taxableAmount + itemTaxAmount) * 100) / 100;
        const cost = Math.round(product.purchasePrice * item.quantity * 100) / 100;

        totalSubtotal = Math.round((totalSubtotal + subtotal) * 100) / 100;
        totalPreTaxDiscount = Math.round((totalPreTaxDiscount + discountAmount) * 100) / 100;
        totalTaxAmount = Math.round((totalTaxAmount + itemTaxAmount) * 100) / 100;
        totalCost = Math.round((totalCost + cost) * 100) / 100;

        saleItems.push({
          id: "SI-" + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          unit: product.unit || "Piece",
          quantity: item.quantity,
          unitPrice,
          subtotal,
          discount: discountPercent,
          taxRate: itemTaxRate,
          taxAmount: itemTaxAmount,
          finalAmount,
        });
      }

      // If client explicitly passed overall tax amount, respect it (e.g. if tax disabled at sale level)
      if (valid.tax !== undefined) {
        totalTaxAmount = valid.tax;
      }

      // Price after pre-tax discount and tax
      const priceBeforeAdditionalDiscount = Math.round((totalSubtotal - totalPreTaxDiscount + totalTaxAmount) * 100) / 100;
      
      // Additional customer discount
      const additionalDiscount = valid.discount !== undefined ? valid.discount : 0;
      const amountBeforeAdjustment = Math.round((priceBeforeAdditionalDiscount - additionalDiscount) * 100) / 100;

      // Final adjustment / round-off
      let adjustment = 0;
      if (valid.finalAmount !== undefined) {
        adjustment = Math.round((valid.finalAmount - amountBeforeAdjustment) * 100) / 100;
      } else if (valid.adjustment !== undefined) {
        adjustment = valid.adjustment;
      }

      const totalFinalAmount = Math.round((amountBeforeAdjustment + adjustment) * 100) / 100;
      if (totalFinalAmount < 0) {
        throw new BusinessRuleError("Final payable amount cannot be negative");
      }

      const totalDiscount = Math.round((totalPreTaxDiscount + additionalDiscount) * 100) / 100;
      const grossProfit = Math.round((totalFinalAmount - totalCost) * 100) / 100;
      const profitMargin = totalFinalAmount > 0 ? Math.round(((grossProfit / totalFinalAmount) * 100) * 10) / 10 : 0;

      // Pass tx to sale creation
      const sale = await this.saleRepo.create({
        subtotal: totalSubtotal,
        discount: totalDiscount,
        tax: totalTaxAmount,
        adjustment,
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
