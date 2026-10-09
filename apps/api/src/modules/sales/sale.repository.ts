import { Sale } from "@stock-inventra/types";

export interface SaleRepository {
  findMany(filters: any, tx?: any): Promise<Sale[]>;
  findById(id: string, tx?: any): Promise<Sale | null>;
  create(data: Omit<Sale, "id" | "createdAt">, tx?: any): Promise<Sale>;
  updateStatus(id: string, status: "COMPLETED" | "CANCELLED" | "PENDING", tx?: any): Promise<void>;
  executeTransaction?<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}
