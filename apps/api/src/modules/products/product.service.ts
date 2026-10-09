import { ProductRepository } from "./product.repository";
import { ProductPricingService } from "./product-pricing.service";
import { createProductSchema, updateProductSchema, paginationQuerySchema } from "@stock-inventra/validation";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { paginate } from "../../utils/pagination";
import { Product } from "@stock-inventra/types";

export class ProductService {
  constructor(
    private repo: ProductRepository,
    private pricingService: ProductPricingService
  ) {}

  async findMany(query: unknown) {
    const validQuery = paginationQuerySchema.parse(query);
    const filters = { ...query as any };
    
    const items = await this.repo.findMany(filters);
    return paginate(items, validQuery.page, validQuery.limit);
  }

  async findById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async create(data: unknown) {
    const valid = createProductSchema.parse(data);
    
    const existingSku = await this.repo.findBySku(valid.sku);
    if (existingSku) {
      throw new ConflictError("SKU already exists");
    }

    const { sellingPrice, finalPrice } = this.pricingService.calculatePricing(
      valid.purchasePrice,
      valid.marginPercent,
      valid.discountPercent,
      valid.taxPercent
    );

    const status = this.pricingService.determineStatus(valid.initialStock, valid.lowStockThreshold);

    return this.repo.create({
      ...valid,
      sellingPrice,
      finalPrice,
      currentStock: valid.initialStock,
      status
    });
  }

  async update(id: string, data: unknown) {
    const product = await this.findById(id);
    const valid = updateProductSchema.parse(data);

    if (valid.sku && valid.sku !== product.sku) {
      const existingSku = await this.repo.findBySku(valid.sku);
      if (existingSku) throw new ConflictError("SKU already exists");
    }

    const purchasePrice = valid.purchasePrice ?? product.purchasePrice;
    const marginPercent = valid.marginPercent ?? product.marginPercent;
    const discountPercent = valid.discountPercent ?? product.discountPercent;
    const taxPercent = valid.taxPercent ?? product.taxPercent;

    const { sellingPrice, finalPrice } = this.pricingService.calculatePricing(
      purchasePrice,
      marginPercent,
      discountPercent,
      taxPercent
    );

    const lowThreshold = valid.lowStockThreshold ?? product.lowStockThreshold;

    const { currentStock, initialStock, ...allowedUpdates } = valid as any;
    
    const updateData: any = {
      ...allowedUpdates,
      sellingPrice,
      finalPrice,
    };

    if (initialStock !== undefined && initialStock !== product.initialStock) {
      const difference = initialStock - product.initialStock;
      updateData.initialStock = initialStock;
      updateData.currentStock = product.currentStock + difference;
      updateData._stockAdjustment = difference;
    }

    const currentStockAfterUpdate = updateData.currentStock ?? product.currentStock;
    updateData.status = this.pricingService.determineStatus(currentStockAfterUpdate, lowThreshold);

    return this.repo.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id); // Ensure exists
    await this.repo.delete(id);
  }
}
