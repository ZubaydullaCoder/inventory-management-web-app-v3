**Guide Document 9: Prisma & Database Optimization: Best Practices (JavaScript + JSDoc Edition)**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document provides the best practices for using Prisma ORM to interact with our NeonDB (PostgreSQL) database. The AI agent must follow these guidelines to ensure data integrity, type safety, and high performance in all database operations.

**2. Schema Design (`schema.prisma`)**

The `schema.prisma` file is the single source of truth for our database structure.

- **Naming Conventions:** Use `PascalCase` for model names and `camelCase` for field names.
- **Indexes are Crucial for Performance:**

  - **AI Action:** Add an `@index` or `@@index` to any field or combination of fields that will be frequently used in `WHERE` clauses for filtering or lookups. This is one of the most important performance optimizations.

  ```prisma
  model Product {
    id        String   @id @default(cuid())
    name      String
    ownerId   String   // Foreign key for lookups
    createdAt DateTime @default(now())

    @@index([ownerId]) // Add an index to the ownerId field
  }
  ```

- **Use Enums for Fixed Sets:** For fields with a limited set of possible values (e.g., user roles, transaction statuses), use a Prisma `enum`.
  ```prisma
  enum Role {
    SHOP_OWNER
    SHOP_STAFF
  }
  ```
- **Default Timestamps:** Use `@default(now())` for `createdAt` fields and `@updatedAt` for `updatedAt` fields to have Prisma manage them automatically.

**3. Prisma Client Usage**

- **Singleton Pattern is Mandatory:** To avoid exhausting database connections, we must use a single, shared instance of the Prisma Client in development.
- **AI Action:** The AI must use the following standard pattern for instantiating the client.
- File: `src/lib/prisma.js`

  ```javascript
  // src/lib/prisma.js
  import { PrismaClient } from "@prisma/client";

  const prismaClientSingleton = () => {
    return new PrismaClient();
  };

  /**
   * @type {ReturnType<prismaClientSingleton>}
   */
  const globalForPrisma = globalThis;

  const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

  export default prisma;

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

- **Type Safety with JSDoc:** Prisma automatically generates types from your schema. The AI must import these types to provide JSDoc annotations for all data access functions.

  ```javascript
  // src/lib/data/products.js
  import prisma from "../prisma";

  /**
   * Fetches a single product by its ID.
   * @param {string} id - The ID of the product to fetch.
   * @returns {Promise<import('@prisma/client').Product | null>}
   */
  export async function getProductById(id) {
    return prisma.product.findUnique({
      where: { id },
    });
  }
  ```

**4. Query Optimization Best Practices**

- **Select Only What You Need (`select`):**

  - **Principle:** Never fetch more data than you need. This reduces data transfer from the database and minimizes memory usage.
  - **AI Action:** This is a mandatory practice. Avoid using a raw `findUnique` or `findMany` if you only need a few fields. Use the `select` option instead.

  ```javascript
  // Bad: Fetches all fields of the product
  // const product = await prisma.product.findUnique({ where: { id } });

  // Good: Fetches only the id and name
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sellingPrice: true,
    },
  });
  ```

- **Include Related Data Carefully (`include`):**
  - **Principle:** `include` is powerful but can be expensive if it pulls in large related tables.
  - **AI Action:** When using `include`, nest a `select` statement inside it to limit the data fetched from the related model.
  ```javascript
  // Fetches a sale and includes only the name and price of the related products
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      saleItems: {
        include: {
          product: {
            select: { name: true, sellingPrice: true }, // Select only needed fields from Product
          },
        },
      },
    },
  });
  ```
- **Paginate Large Datasets (`take`, `skip`):**
  - **Principle:** Never fetch an entire table of records that could grow large (e.g., products, sales, customers).
  - **AI Action:** All queries that return a list of items must implement pagination using `take` (for the page size) and `skip` (for the offset).
  ```javascript
  const page = 1;
  const pageSize = 20;
  const products = await prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  ```
- **Use Transactions for Atomic Operations (`$transaction`):**

  - **Principle:** When a series of database operations must all succeed or all fail together, they must be wrapped in a transaction.
  - **AI Action:** Use `prisma.$transaction()` for critical workflows like finalizing a sale, which involves creating a sale record and updating multiple product stock levels.

  ```javascript
  // Example: Finalizing a sale
  const sale = await prisma.$transaction(async (tx) => {
    // 1. Create the sale record
    const newSale = await tx.sale.create({
      data: {
        /* ... */
      },
    });

    // 2. Update stock for each item in the sale
    for (const item of saleItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    return newSale;
  });
  ```

**5. Separation of Concerns**

- **AI Action:** As defined in Guide #7, all Prisma queries **must** be located in dedicated data/service modules (e.g., `src/lib/data/`, `src/lib/services/`). They must not be called directly from API routes (`route.js`) or React components.

**6. Migrations**

- **Principle:** The `schema.prisma` file is the source of truth. Never alter the database schema manually.
- **Workflow:**
  1.  Modify the `schema.prisma` file.
  2.  Run the command `npx prisma migrate dev --name <descriptive-name>` (e.g., `add-product-sku`).
  3.  Prisma will create a new SQL migration file and apply it to the development database.

**7. AI Agent's Responsibility**

- **`select` is Default:** The AI should default to using `select` to fetch only the necessary fields for any query.
- **Paginate by Default:** The AI must implement pagination for all list-based queries.
- **Use Transactions:** The AI must identify atomic operations and wrap them in `prisma.$transaction()`.
- **Isolate Data Logic:** The AI must place all Prisma calls within functions in the `src/lib/data/` or `src/lib/services/` directories.
- **Add Indexes:** When creating new models or adding fields that will be queried, the AI should proactively add `@@index` to the schema.

---

### Status of Guide Documents

All planned guide documents have now been created for the **JavaScript + JSDoc** stack.
