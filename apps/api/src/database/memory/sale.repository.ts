import { SaleRepository } from "../../modules/sales/sale.repository";
import { Sale } from "@stock-inventra/types";
import { memoryDb } from "./db";

export class MemorySaleRepository implements SaleRepository {
  async findMany(filters: any): Promise<Sale[]> {
    let sales = Array.from(memoryDb.sales.values());

    if (filters.status) {
      sales = sales.filter(s => s.status === filters.status);
    }
    
    sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sales;
  }

  async findById(id: string): Promise<Sale | null> {
    return memoryDb.sales.get(id) || null;
  }

  async create(data: Omit<Sale, "id" | "createdAt">): Promise<Sale> {
    const id = "SALE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const sale: Sale = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    memoryDb.sales.set(id, sale);
    return sale;
  }

  async updateStatus(id: string, status: "COMPLETED" | "CANCELLED" | "PENDING"): Promise<void> {
    const sale = memoryDb.sales.get(id);
    if (!sale) throw new Error("Sale not found");
    sale.status = status;
  }
}
