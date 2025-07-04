import { PrismaClient } from "@prisma/client";

/**
 * This module provides a singleton instance of the Prisma Client.
 *
 * In a serverless environment or during development with hot-reloading,
 * it's crucial to prevent creating multiple instances of PrismaClient,
 * which can exhaust the database connection pool.
 *
 * This pattern checks for an existing instance on the global object
 * and reuses it if available, creating a new one otherwise.
 */

// Add prisma to the NodeJS global type
/** @type {{ prisma: PrismaClient | undefined }} */
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Log database queries for debugging purposes
    // log: ['query', 'info', 'warn', 'error'],
  });

// In development, store the prisma instance on the global object to reuse across hot-reloads.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
