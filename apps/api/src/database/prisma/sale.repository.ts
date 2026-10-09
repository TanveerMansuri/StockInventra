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
      finalAmount: data.finalAmount.toNumber(),
      totalCost: data.totalCost.toNumber(),
      grossProfit: data.grossProfit.toNumber(),
      profitMargin: data.profitMargin.toNumber(),
      status: data.status as "COMPLETED" | "CANCELLED" | "PENDING",
      createdAt: data.createdAt.toISOString(),
      items: data.items ? data.items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toNumber(),
        subtotal: i.subtotal.toNumber(),
        discount: i.discount.toNumber(),
        finalAmount: i.finalAmount.toNumber(),
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
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return sales.map((s: any) => this.mapToSale(s));
  }

  async findById(id: string, tx?: any): Promise<Sale | null> {
    const client = tx || prisma;
    const sale = await client.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    return sale ? this.mapToSale(sale) : null;
  }

  async create(data: Omit<Sale, "id" | "createdAt">, tx?: any): Promise<Sale> {
    const client = tx || prisma;
    const sale = await client.sale.create({
      data: {
        subtotal: data.subtotal,
        discount: data.discount,
        finalAmount: data.finalAmount,
        totalCost: data.totalCost,
        grossProfit: data.grossProfit,
        profitMargin: data.profitMargin,
        status: data.status as SaleStatus,
        items: {
          create: data.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            unitCost: i.unitPrice, // Ideally unitCost is historical cost, setting same as unitPrice for simplicity or map from data
            discount: i.discount,
            subtotal: i.subtotal,
            finalAmount: i.finalAmount,
          })),
        },
      },
      include: { items: true },
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
