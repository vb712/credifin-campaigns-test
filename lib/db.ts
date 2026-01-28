import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// PrismaClient singleton for Next.js with Neon serverless adapter
// Prevents multiple instances during hot reload in development

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Check if database URL is configured
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL not configured. Database operations will fail.");
    // In development without DB, use a placeholder that will fail on connect
    const adapter = new PrismaNeon({ connectionString: "postgresql://placeholder:placeholder@placeholder/placeholder" });
    return new PrismaClient({ adapter });
  }

  // Use Neon serverless adapter with connection string config
  const adapter = new PrismaNeon({ connectionString: databaseUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
