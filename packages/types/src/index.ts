// Common
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User & Auth
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

// Product Units of Measurement
export const PRODUCT_UNITS = [
  "Piece",
  "Kilogram",
  "Gram",
  "Litre",
  "Millilitre",
  "Packet",
  "Box",
  "Dozen",
  "Metre",
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

// Standard abbreviations for display
export const UNIT_SHORT_LABELS: Record<string, string> = {
  Piece: "pcs",
  Kilogram: "kg",
  Gram: "g",
  Litre: "L",
  Millilitre: "ml",
  Packet: "pkt",
  Box: "box",
  Dozen: "doz",
  Metre: "m",
};

/**
 * Format quantity and unit cleanly:
 * e.g. formatQuantityWithUnit(2, "Kilogram") -> "2 kg"
 * e.g. formatQuantityWithUnit(0.5, "Kilogram") -> "0.5 kg"
 * e.g. formatQuantityWithUnit(3, "Piece") -> "3 pcs"
 */
export function formatQuantityWithUnit(quantity: number, unit: string = "Piece"): string {
  const shortUnit = UNIT_SHORT_LABELS[unit] || unit;
  // Format numbers cleanly removing unnecessary trailing zeros (e.g. 0.5 instead of 0.500)
  const formattedNumber = Number(Number(quantity).toFixed(3)).toString();
  return `${formattedNumber} ${shortUnit}`;
}

// Product
export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  purchasePrice: number;
  marginPercent: number;
  sellingPrice: number;
  discountPercent: number;
  taxPercent: number;
  finalPrice: number;
  initialStock: number;
  currentStock: number;
  lowStockThreshold: number;
  description?: string;
  image?: string;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// Inventory
export type MovementType = "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN";

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface InventoryItem {
  product: Product;
  stockIn: number;
  sold: number;
  currentStock: number;
  minimumStock: number;
  status: string;
  lastUpdated: string;
}

// Sale
export interface SaleItem {
  id: string;
  productId: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  taxRate?: number;
  taxAmount?: number;
  finalAmount: number;
  product?: Product;
}

export interface Sale {
  id: string;
  subtotal: number;
  discount: number;
  tax: number;
  adjustment: number;
  finalAmount: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  status: "COMPLETED" | "CANCELLED" | "PENDING";
  items: SaleItem[];
  createdAt: string;
}

// Settings
export interface AppSettings {
  business: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    logo: string | null;
  };
  inventory: {
    lowStockThreshold: number;
    defaultMargin: number;
    defaultDiscount: number;
  };
  currency: {
    country: string;
    currency: string;
    taxRate: number;
  };
}
