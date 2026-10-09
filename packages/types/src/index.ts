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

// Product
export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
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
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  finalAmount: number;
}

export interface Sale {
  id: string;
  subtotal: number;
  discount: number;
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
    currency: string;
    taxRate: number;
  };
}
