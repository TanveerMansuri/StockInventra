import { CategoryRepository } from "../../modules/categories/category.repository";
import { Category } from "@stock-inventra/types";
import { prisma } from "../prisma";
import { Status } from "@prisma/client";

export class PrismaCategoryRepository implements CategoryRepository {
  private mapToCategory(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      status: data.status as "ACTIVE" | "INACTIVE",
      productCount: data._count?.products || 0,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };
  }

  async findMany(filters: any): Promise<Category[]> {
    const where: any = {};
    if (filters.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.status) {
      where.status = filters.status as Status;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return categories.map(c => this.mapToCategory(c));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return category ? this.mapToCategory(category) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { name },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return category ? this.mapToCategory(category) : null;
  }

  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status as Status,
      },
    });
    return this.mapToCategory({ ...category, _count: { products: 0 } });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.productCount;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { products: true } }
      }
    });
    return this.mapToCategory(category);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async countProducts(id: string): Promise<number> {
    return prisma.product.count({ where: { categoryId: id } });
  }
}
