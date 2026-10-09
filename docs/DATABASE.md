# Database Documentation

Stock Inventra uses a robust **PostgreSQL** + **Prisma ORM** setup for persistence. 
This phase completely uncoupled the Memory repositories and replaced them with production-ready PostgreSQL persistence while keeping business logic inside the decoupled Services.

## 1. Setup & Requirements

- **PostgreSQL**: Required (version 13+ recommended).
- **Prisma**: Configured via `prisma/schema.prisma` in the monorepo root.

## 2. Environment Variables

The backend relies on the `DATABASE_URL` environment variable for connections. You **must** provide this variable yourself; we do not assume hardcoded credentials.

Example inside your `.env` file:
```
DATABASE_URL="postgresql://username:password@localhost:5432/stock_inventra"
```

## 3. Workflow & Migrations

- Prisma schema is located at `prisma/schema.prisma`.
- To generate the Prisma Client, run:
  ```bash
  yarn workspace api prisma generate
  ```
- To migrate your database (development), run:
  ```bash
  yarn workspace api prisma migrate dev
  ```
- The initial migration `init_stock_inventra` bootstraps all tables necessary for Phase 08.

## 4. Transaction Strategy

Financial safety is critical for Stock Inventra. We implemented **Prisma Transactions** (`prisma.$transaction`) without leaking Prisma-specific abstractions into the Business Services.
- `SaleService.createSale` and `SaleService.cancelSale` execute within transactional boundaries.
- All operations (stock validation, pricing checks, sale record generation, inventory adjustments, and stock status recalculation) are wrapped in one atomic operation.
- **Rollback Behavior**: If any part of the transaction fails (e.g. insufficient stock discovered dynamically during sale creation), everything is automatically rolled back, leaving zero orphaned records.

## 5. Financial Precision Strategy

Do **NOT** store arbitrary JavaScript floats as money in the database.
- Database uses PostgreSQL `DECIMAL(10, 2)` for monetary values (Prices, Costs, Subtotals) and `DECIMAL(5, 2)` for percentages (Margins, Discounts, Taxes).
- Prisma returns these as `Prisma.Decimal` instances.
- To safely transport these to the Frontend, the Prisma Repositories immediately call `.toNumber()` on all Decimals when mapping Prisma schemas to the application's Domain Types (`@stock-inventra/types`), matching the API Contract. This prevents object leaks over JSON and keeps responses strictly consistent.

## 6. Authentication Persistence

- `MemorySessionRepository` was swapped out for `PrismaSessionRepository`.
- User Sessions are now stored in Postgres (`Session` model) and map securely to the cookie-based sessions, without ever leaking session hashes to the UI.
- `passwordHash` is never queried or returned directly to controllers; mapping occurs tightly at the Repository edge.

## 7. Important Relationships & Indexes

- **User**: One-to-Many with `Sales` and `Sessions`. Indexed on Email.
- **Product**: Indexed on `categoryId` and `sku`. `StockMovement` tracks the full historical trace of changes to product stock.
- **Sale**: Bound to `SaleItem` inside transactions. Includes history-safe pricing (we clone the `unitPrice` and `unitCost` dynamically at the time of sale so future product price updates do not retroactively break previous reporting).
