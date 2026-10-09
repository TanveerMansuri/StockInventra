import { z } from "zod";

// Base Pagination/Query Schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Auth & Profile
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().nullable().optional(),
});

// Product
export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  categoryId: z.string().min(1),
  purchasePrice: z.number().min(0),
  marginPercent: z.number().min(0),
  discountPercent: z.number().min(0).max(100).default(0),
  initialStock: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(10),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Category
export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateCategorySchema = createCategorySchema.partial();

// Inventory
export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["PURCHASE", "SALE", "ADJUSTMENT", "RETURN"]),
  quantity: z.number().int().refine(val => val !== 0, "Quantity cannot be zero"),
  note: z.string().optional(),
});

// Sale
export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  discount: z.number().min(0).max(100).default(0),
});

export const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
});

// Settings
export const updateSettingsSchema = z.object({
  business: z.object({
    businessName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().url().optional().nullable(),
  }).optional(),
  inventory: z.object({
    lowStockThreshold: z.number().min(0),
    defaultMargin: z.number().min(0),
    defaultDiscount: z.number().min(0).max(100),
  }).optional(),
  currency: z.object({
    currency: z.string().min(2),
    taxRate: z.number().min(0).max(100),
  }).optional(),
});
