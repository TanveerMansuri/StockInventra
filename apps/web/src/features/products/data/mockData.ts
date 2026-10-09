export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
}

export const mockProducts: Product[] = [
  { id: "1", name: "Premium Coffee Beans", sku: "PCB-001", category: "Beverages", purchasePrice: 250, sellingPrice: 400, stock: 120, status: "In Stock", image: "☕" },
  { id: "2", name: "Wireless Keyboard", sku: "WK-002", category: "Electronics", purchasePrice: 800, sellingPrice: 1250, stock: 35, status: "Low Stock", image: "⌨️" },
  { id: "3", name: "Cotton T-Shirt", sku: "TS-003", category: "Apparel", purchasePrice: 300, sellingPrice: 500, stock: 0, status: "Out of Stock", image: "👕" },
  { id: "4", name: "Ceramic Mug", sku: "CM-004", category: "Home & Kitchen", purchasePrice: 120, sellingPrice: 250, stock: 85, status: "In Stock", image: "🍵" },
  { id: "5", name: "Leather Wallet", sku: "LW-005", category: "Accessories", purchasePrice: 800, sellingPrice: 1200, stock: 42, status: "Low Stock", image: "👛" },
  { id: "6", name: "Bluetooth Speaker", sku: "BS-006", category: "Electronics", purchasePrice: 1200, sellingPrice: 1899, stock: 18, status: "Low Stock", image: "🔈" },
  { id: "7", name: "Office Backpack", sku: "OB-007", category: "Bags", purchasePrice: 800, sellingPrice: 1499, stock: 60, status: "In Stock", image: "🎒" }
];
