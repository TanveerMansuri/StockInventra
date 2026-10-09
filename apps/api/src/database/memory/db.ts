import { UserProfile, Product, Category, Sale, StockMovement, AppSettings } from "@stock-inventra/types";

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export const memoryDb = {
  users: new Map<string, UserProfile & { passwordHash: string }>(),
  sessions: new Map<string, Session>(),
  products: new Map<string, Product>(),
  categories: new Map<string, Category>(),
  sales: new Map<string, Sale>(),
  movements: new Map<string, StockMovement>(),
  settings: {
    business: {
      businessName: "Stock Inventra",
      email: "info@stockinventra.com",
      phone: "+91 98765 43210",
      address: "123 Business Street",
      logo: null,
    },
    inventory: {
      lowStockThreshold: 20,
      defaultMargin: 40,
      defaultDiscount: 0,
    },
    currency: {
      currency: "INR",
      taxRate: 18,
    },
  } as AppSettings,
};

// Seed admin user for testing
import bcrypt from "bcryptjs";
const hash = bcrypt.hashSync("password", 10);
memoryDb.users.set("admin-1", {
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  role: "ADMIN",
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordHash: hash,
});
