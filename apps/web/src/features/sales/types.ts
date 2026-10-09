import { Product } from "@stock-inventra/types";

export interface PendingSaleItem {
  id: string;
  product: Product;
  quantity: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  calculatedDiscount: number;
  subtotal: number;
  taxAmount: number;
  finalAmount: number;
  totalCost: number;
}
