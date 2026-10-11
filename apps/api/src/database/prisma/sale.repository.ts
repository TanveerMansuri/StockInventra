import { SaleRepository } from "../../modules/sales/sale.repository";
import { Sale, SaleItem } from "@stock-inventra/types";
import { prisma } from "../prisma";
import { SaleStatus } from "@prisma/client";

export class PrismaSaleRepository implements SaleRepository {
  private mapToSale(data: any): Sale {
    return {
      id: data.id,
      subtotal: data.subtotal.toNumber(),
      discount: data.discount.toNumber(),
      tax: data.tax ? data.tax.toNumber() : 0,
      adjustment: data.adjustment ? data.adjustment.toNumber() : 0,
      finalAmount: data.finalAmount.toNumber(),
      totalCost: data.totalCost.toNumber(),
      grossProfit: data.grossProfit.toNumber(),
      profitMargin: data.profitMargin.toNumber(),
      status: data.status as "COMPLETED" | "CANCELLED" | "PENDING",
      createdAt: data.createdAt.toISOString(),
      items: data.items ? data.items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        unit: i.unit || (i.product?.unit || "Piece"),
        quantity: typeof i.quantity === 'number' ? i.quantity : i.quantity.toNumber(),
        unitPrice: i.unitPrice.toNumber(),
        subtotal: i.subtotal.toNumber(),
        discount: i.discount.toNumber(),
        taxRate: i.taxRate ? i.taxRate.toNumber() : 0,
        taxAmount: i.taxAmount ? i.taxAmount.toNumber() : 0,
        finalAmount: i.finalAmount.toNumber(),
        product: i.product ? {
          ...i.product,
          purchasePrice: i.product.purchasePrice.toNumber(),
          marginPercent: i.product.marginPercent.toNumber(),
          sellingPrice: i.product.sellingPrice.toNumber(),
          discountPercent: i.product.discountPercent.toNumber(),
          taxPercent: i.product.taxPercent.toNumber(),
          finalPrice: i.product.finalPrice.toNumber(),
          initialStock: typeof i.product.initialStock === 'number' ? i.product.initialStock : i.product.initialStock.toNumber(),
          currentStock: typeof i.product.currentStock === 'number' ? i.product.currentStock : i.product.currentStock.toNumber(),
          lowStockThreshold: typeof i.product.lowStockThreshold === 'number' ? i.product.lowStockThreshold : i.product.lowStockThreshold.toNumber(),
          createdAt: i.product.createdAt.toISOString(),
          updatedAt: i.product.updatedAt.toISOString(),
        } : undefined,
      })) : [],
    };
  }

  async findMany(filters: any, tx?: any): Promise<Sale[]> {
    const client = tx || prisma;
    const where: any = {};
    if (filters.status) {
      where.status = filters.status as SaleStatus;
    }
    const sales = await client.sale.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sales.map((s: any) => this.mapToSale(s));
  }

  async findById(id: string, tx?: any): Promise<Sale | null> {
    const client = tx || prisma;
    const sale = await client.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    return sale ? this.mapToSale(sale) : null;
  }

  async create(data: Omit<Sale, "id" | "createdAt">, tx?: any): Promise<Sale> {
    const client = tx || prisma;
    const sale = await client.sale.create({
      data: {
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax || 0,
        adjustment: data.adjustment || 0,
        finalAmount: data.finalAmount,
        totalCost: data.totalCost,
        grossProfit: data.grossProfit,
        profitMargin: data.profitMargin,
        status: data.status as SaleStatus,
        items: {
          create: data.items.map(i => ({
            productId: i.productId,
            unit: i.unit || "Piece",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            unitCost: i.unitPrice, // historical unit price/cost
            discount: i.discount,
            taxRate: i.taxRate || 0,
            taxAmount: i.taxAmount || 0,
            subtotal: i.subtotal,
            finalAmount: i.finalAmount,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToSale(sale);
  }

  async updateStatus(id: string, status: "COMPLETED" | "CANCELLED" | "PENDING", tx?: any): Promise<void> {
    const client = tx || prisma;
    await client.sale.update({
      where: { id },
      data: { status: status as SaleStatus },
    });
  }

  async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
