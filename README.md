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
Once your `DATABASE_URL` is configured in `.env`, create and synchronize your PostgreSQL database schema:

```bash
# Push schema directly to the database
yarn db:push

# Or create and apply Prisma migrations:
yarn db:migrate
```

## 5. Seed / Initial Admin Setup
To populate your fresh installation with the administrator account and foundational sample categories, run the seed command.

### Interactive Mode:
The script will prompt you to enter a secure password for the initial administrator:
```bash
yarn db:seed
```

### Scripted / Automated Mode:
You can provide your desired administrator credentials directly via environment variables:
```bash
ADMIN_EMAIL="admin@stockinventra.com" ADMIN_PASSWORD="YourSecurePassword123" yarn db:seed
```

> **Security Note:** Stock Inventra does not enforce or ship with insecure hardcoded default passwords. Your administrator credentials are encrypted using bcrypt (cost factor 10) directly in PostgreSQL.

## 6. Secure Administrator Password Recovery Utility
If you forget your administrator password or need to provision new credentials directly on the server without email or SMTP dependencies, use the included CLI password recovery utility.

### Interactive Mode:
Run the command and follow the prompts to enter your email and securely type your new password:
```bash
yarn reset:admin
```

### Non-Interactive / Scripted Mode:
You can also provide the credentials via environment variables:
```bash
ADMIN_EMAIL="admin@stockinventra.com" ADMIN_PASSWORD="YourSecurePassword123" yarn reset:admin
```

This utility hashes the new password with bcrypt (cost factor 10) directly into PostgreSQL through Prisma, invalidates all existing active sessions, and never outputs or stores plaintext passwords.

## 7. Local Development Commands
To start both the frontend (Vite) and backend (Express) development servers concurrently:
```bash
yarn dev
```
The application will be accessible at `http://localhost:5173` by default. Backend API runs on `http://localhost:4000`.

## 8. Currency Selection and Configuration Instructions
Stock Inventra uses a single currency configuration for all financial displays.
1. On a fresh installation, the default currency is **USD**.
2. Log in and navigate to **Settings -> Regional & Currency**.
3. Select your local currency from the dropdown (e.g., EUR, INR, GBP).
4. Click **Save Changes**. The entire UI will immediately update to reflect the new currency format.

## 9. Currency Behavior Notice
**Important:** Currency changes in Stock Inventra apply *only* to formatting and display.
- Changing the currency **does not** perform automatic exchange-rate conversions.
- Existing historical transactions, stored product prices, inventory values, and profit margins will remain mathematically identical in the database.
- Please choose your base currency before importing bulk historical data.

## 10. Basic Troubleshooting
- **Database Connection Error:** Ensure PostgreSQL is running and your `DATABASE_URL` matches your local setup.
- **Port Conflicts:** If `yarn dev` fails due to a port in use, edit the `PORT` in `.env` and `VITE_API_BASE_URL` in `apps/web/.env`.
- **Blank Currency Dropdown:** Make sure you've successfully saved your Business Settings at least once. If you see rendering issues, ensure you are running the latest version of your browser.
