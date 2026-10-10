# Stock Inventra

**Product:** Premium Inventory & Sales Management System

Stock Inventra is a modern, locally installable inventory management system designed for small and medium-sized businesses. It provides powerful tools for tracking stock, managing sales, and analyzing business performance.

## 1. Prerequisites
- **Node.js**: v18 or higher
- **Yarn**: package manager
- **PostgreSQL**: v13 or higher

## 2. Installation Steps
1. Unzip the source code archive and open your terminal in the extracted directory.
2. Run `yarn install` to install all dependencies across the monorepo.

## 3. Environment Variable Setup
Before starting the application, you must configure your environment variables:

1. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and update the `DATABASE_URL` with your local PostgreSQL connection string.
3. Set `COOKIE_SECRET` to a strong, random string to secure user sessions.
4. (Optional) Adjust `PORT` if you need the backend to run on a different port (default is 4000).

*Note: Real secrets must only be kept in local `.env` files. The `.env` file is intentionally excluded from Git and source-code distributions.*

## 4. Database Creation and Migration Commands
Once your `DATABASE_URL` is configured, set up your PostgreSQL database schema:

```bash
# Apply database migrations
yarn workspace @stock-inventra/database db:push
# Or if using Prisma migrate:
# yarn workspace @stock-inventra/database prisma migrate dev
```

## 5. Seed/Demo Data Instructions
To populate your fresh installation with a default admin user and initial demo data (if applicable), run the seed script:
```bash
yarn workspace @stock-inventra/database db:seed
```

## 6. Local Development Commands
To start both the frontend (Vite) and backend (Express) development servers concurrently:
```bash
yarn dev
```
The application will be accessible at `http://localhost:5173` by default.

## 7. Currency Selection and Configuration Instructions
Stock Inventra uses a single currency configuration for all financial displays.
1. On a fresh installation, the default currency is **USD**.
2. Log in and navigate to **Settings -> Regional & Currency**.
3. Select your local currency from the dropdown (e.g., EUR, INR, GBP).
4. Click **Save Changes**. The entire UI will immediately update to reflect the new currency format.

## 8. Currency Behavior Notice
**Important:** Currency changes in Stock Inventra apply *only* to formatting and display.
- Changing the currency **does not** perform automatic exchange-rate conversions.
- Existing historical transactions, stored product prices, inventory values, and profit margins will remain mathematically identical in the database.
- Please choose your base currency before importing bulk historical data.

## 9. Basic Troubleshooting
- **Database Connection Error:** Ensure PostgreSQL is running and your `DATABASE_URL` matches your local setup.
- **Port Conflicts:** If `yarn dev` fails due to a port in use, edit the `PORT` in `.env` and `VITE_API_URL` in `apps/web/.env`.
- **Blank Currency Dropdown:** Make sure you've successfully saved your Business Settings at least once. If you see rendering issues, ensure you are running the latest version of your browser.
