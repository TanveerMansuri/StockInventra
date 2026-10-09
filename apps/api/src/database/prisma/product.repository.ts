import { ProductRepository } from "../../modules/products/product.repository";
import { Product } from "@stock-inventra/types";
import { prisma } from "../prisma";
import { ProductStatus } from "@prisma/client";

export class PrismaProductRepository implements ProductRepository {
  private mapToProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId,
      purchasePrice: data.purchasePrice.toNumber(),
      marginPercent: data.marginPercent.toNumber(),
      sellingPrice: data.sellingPrice.toNumber(),
      discountPercent: data.discountPercent.toNumber(),
      finalPrice: data.finalPrice.toNumber(),
      initialStock: data.initialStock,
      currentStock: data.currentStock,
      lowStockThreshold: data.lowStockThreshold,
      description: data.description || undefined,
      image: data.image || undefined,
      status: data.status as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK",
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };
  }

  async findMany(filters: any): Promise<Product[]> {
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

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const products = await prisma.product.findMany({ where, orderBy });
    return products.map(p => this.mapToProduct(p));
  }

  async findById(id: string, tx?: any): Promise<Product | null> {
    const client = tx || prisma;
    const product = await client.product.findUnique({ where: { id } });
    return product ? this.mapToProduct(product) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({ where: { sku } });
    return product ? this.mapToProduct(product) : null;
  }

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        purchasePrice: data.purchasePrice,
        marginPercent: data.marginPercent,
        sellingPrice: data.sellingPrice,
        discountPercent: data.discountPercent,
        finalPrice: data.finalPrice,
        initialStock: data.initialStock,
        currentStock: data.currentStock,
        lowStockThreshold: data.lowStockThreshold,
        description: data.description,
        image: data.image,
        status: data.status as ProductStatus,
      },
    });
    return this.mapToProduct(product);
  }

  async update(id: string, data: Partial<Product>, tx?: any): Promise<Product> {
    const client = tx || prisma;
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const product = await client.product.update({
      where: { id },
      data: updateData,
    });
    return this.mapToProduct(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
