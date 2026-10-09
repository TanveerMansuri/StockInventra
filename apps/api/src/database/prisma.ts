import { PrismaClient } from "@prisma/client";

// Ensure a single instance of PrismaClient in development to prevent 
// exhausting the database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
