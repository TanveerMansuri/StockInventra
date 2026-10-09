# Stock Inventra Architecture

## 1. Project Overview
Stock Inventra is a commercial source-code product (Inventory & Sales Management System) aimed at small and medium-sized businesses.

## 2. Technology Stack
- **Monorepo:** Turborepo, Yarn
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Validation:** Zod

## 3. Monorepo Structure
```
stock-inventra/
├── apps/
│   ├── web/        (React/Vite Frontend)
│   └── api/        (Node/Express Backend)
├── packages/
│   ├── ui/         (Shared UI Components)
│   ├── types/      (Shared TypeScript Types)
│   ├── validation/ (Shared Zod Schemas)
│   ├── config/     (Shared Configuration)
│   └── utils/      (Shared Utilities)
├── prisma/         (Database Schema & Migrations)
└── docs/           (Documentation)
```

## 4. Frontend Architecture
Feature-oriented architecture:
`apps/web/src/`
- `app/` - Global app setup (providers, store configuration)
- `components/` - Global/shared UI components
- `features/` - Feature modules (e.g., auth, dashboard, products, sales)
  - Each feature contains its own `components`, `hooks`, `services`, `types`
- `layouts/` - Page layout components (Sidebar, Header, etc.)
- `hooks/` - Global reusable hooks
- `lib/` - Third-party library configurations (axios, etc.)
- `services/` - Global API communication
- `types/` - Global TypeScript types
- `routes/` - Route definitions
- `styles/` - Global CSS/Tailwind configuration

## 5. Backend Architecture
Modular architecture:
`apps/api/src/`
- `config/` - Environment and app configuration
- `middleware/` - Express middleware (auth, error handling)
- `modules/` - Feature modules (e.g., auth, products, sales)
  - `[module].routes.ts`
  - `[module].controller.ts`
  - `[module].service.ts`
  - `[module].repository.ts`
- `database/` - Prisma client instantiation
- `utils/` - Backend utility functions
- `types/` - Backend TypeScript types

## 6. Feature Architecture
Frontend features will include:
- `auth`, `dashboard`, `products`, `categories`, `inventory`, `sales`, `analytics`, `profile`, `settings`
Backend modules will parallel the frontend features where applicable.

## 7. Shared Component Rules
- **Global / Shared Components:** Used across multiple features (e.g., Buttons, Inputs, Modals, Tables). Located in `apps/web/src/components` or `packages/ui`.
- **Feature-Specific Components:** Used only within a specific feature (e.g., `ProductTable`, `SaleForm`). Located inside `apps/web/src/features/[feature]/components`.

## 8. Repository/Service/Controller Rules
- **Controllers:** Handle HTTP requests and responses. Remain thin.
- **Services:** Contain business logic.
- **Repositories:** Handle data access and Prisma queries.
- **Validation:** Separate validation (Zod) from business logic.

## 9. Database Architecture Plan
Expected core models:
- `User`
- `Category`
- `Product` (belongs to Category)
- `Sale` (belongs to User)
- `SaleItem` (belongs to Sale and Product)
- `StockMovement` (belongs to Product)

## 10. Authentication Architecture Plan
Support for:
- Login/Logout
- Current user context
- Password hashing
- Protected routes
- Profile management (view, edit, change password)

## 11. API Architecture Plan
Planned endpoints:
- **Auth:** `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Products:** CRUD operations under `/products`
- **Categories:** CRUD operations under `/categories`
- **Inventory:** `GET /inventory`, `GET /inventory/movements`
- **Sales:** `GET /sales`, `POST /sales`, `GET /sales/:id`
- **Dashboard & Analytics:** `GET /dashboard`, `GET /analytics`
- **Profile:** Profile management endpoints

## 12. Environment Configuration
- Never hardcode credentials.
- Use `.env` for local development.
- Provide `.env.example` with clear placeholders.
- Frontend variables prefixed with `VITE_`.

## 13. Asset/Icon Strategy
- **Icons:** Use Lucide React.
- **Assets:** Custom SVGs, images, and logos belong in `public/`.

## 14. Design System Direction
- **Primary Color:** `#7A1830`
- **Dark Primary:** `#641326`
- **Warm Ivory:** `#F5EFE6`
- **Background:** `#FCFCFB`
- **White:** `#FFFFFF`
- **Text:** `#242124`
- **Muted:** `#77706D`
- **Border:** `#EAE5E0`
- **Feel:** Premium, bright, professional, clean, elegant, business-focused.

## 15. Naming Conventions
- **Files/Components:** PascalCase for React components (`ProductTable.tsx`), camelCase for utilities/services (`product.service.ts`).
- **Folders:** kebab-case or camelCase, remain consistent.
- **Types:** PascalCase.

## 16. File-size/Component Rules
- Keep files small and focused (prefer under 100 lines).
- Components must have a single responsibility.
- Avoid huge "god components".

## 17. Development Workflow
Run `yarn dev` to start all apps in development mode. Ensure database is running and Prisma client is generated.

## 18. Future Implementation Phases
1. Architecture
2. Design System
3. Icon / Asset Strategy
4. UI Components
5. Screens
6. API Contracts
7. Backend Modules
8. Database + Prisma
9. Frontend <-> Backend Integration
10. Seed / Demo Data
11. Testing + Refactoring
12. README + .env.example + database_schema.sql
13. Screenshots
14. ZIP
15. CodeSter Listing
