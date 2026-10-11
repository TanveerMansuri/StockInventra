import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { createAuthMiddleware } from './middleware/auth';

// Repositories (Prisma)
import { PrismaUserRepository } from './database/prisma/user.repository';
import { PrismaSessionRepository } from './database/prisma/session.repository';
import { PrismaProductRepository } from './database/prisma/product.repository';
import { PrismaCategoryRepository } from './database/prisma/category.repository';
import { PrismaInventoryRepository, PrismaStockMovementRepository } from './database/prisma/inventory.repository';
import { PrismaSaleRepository } from './database/prisma/sale.repository';
import { PrismaSettingsRepository } from './database/prisma/settings.repository';
import { NotificationRepository } from './modules/notifications/notifications.repository';

// Services
import { AuthService } from './modules/auth/auth.service';
import { ProfileService } from './modules/profile/profile.service';
import { ProductService } from './modules/products/product.service';
import { ProductPricingService } from './modules/products/product-pricing.service';
import { CategoryService } from './modules/categories/category.service';
import { InventoryService } from './modules/inventory/inventory.service';
import { SaleService } from './modules/sales/sale.service';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { AnalyticsService } from './modules/analytics/analytics.service';
import { AnalyticsStockRecommendationService } from './modules/analytics/recommendation.service';
import { ReportsService } from './modules/reports/reports.service';
import { SettingsService } from './modules/settings/settings.service';
import { NotificationService } from './modules/notifications/notifications.service';

// Controllers & Routers
import { AuthController } from './modules/auth/auth.controller';
import { createAuthRouter } from './modules/auth/auth.routes';
import { ProfileController } from './modules/profile/profile.controller';
import { createProfileRouter } from './modules/profile/profile.routes';
import { ProductController, createProductRouter } from './modules/products/product.controller';
import { CategoryController, createCategoryRouter } from './modules/categories/category.controller';
import { InventoryController, createInventoryRouter } from './modules/inventory/inventory.controller';
import { SaleController, createSaleRouter } from './modules/sales/sale.controller';
import { DashboardController, createDashboardRouter } from './modules/dashboard/dashboard.controller';
import { AnalyticsController, createAnalyticsRouter } from './modules/analytics/analytics.controller';
import { ReportsController, createReportsRouter } from './modules/reports/reports.controller';
import { SettingsController, createSettingsRouter } from './modules/settings/settings.controller';
import { NotificationController } from './modules/notifications/notifications.controller';
import { createNotificationRouter } from './modules/notifications/notifications.routes';

// 1. Instantiate Prisma Repositories
const userRepo = new PrismaUserRepository();
const sessionRepo = new PrismaSessionRepository();
const productRepo = new PrismaProductRepository();
const categoryRepo = new PrismaCategoryRepository();
const inventoryRepo = new PrismaInventoryRepository();
const movementRepo = new PrismaStockMovementRepository();
const saleRepo = new PrismaSaleRepository();
const settingsRepo = new PrismaSettingsRepository();
const notificationRepo = new NotificationRepository();

// 2. Instantiate Services
const authService = new AuthService(userRepo, sessionRepo);
const profileService = new ProfileService(userRepo);
const productPricingService = new ProductPricingService();
const productService = new ProductService(productRepo, productPricingService);
const categoryService = new CategoryService(categoryRepo);
const inventoryService = new InventoryService(inventoryRepo, movementRepo, productRepo, productPricingService);
const saleService = new SaleService(saleRepo, inventoryService, productRepo, settingsRepo);
const dashboardService = new DashboardService(saleRepo, productRepo);
const analyticsRecService = new AnalyticsStockRecommendationService();
const analyticsService = new AnalyticsService(saleRepo, productRepo, analyticsRecService);
const reportsService = new ReportsService(saleRepo, productRepo, inventoryRepo, movementRepo);
const settingsService = new SettingsService(settingsRepo);
const notificationService = new NotificationService(notificationRepo);

// 3. Instantiate Controllers
const authController = new AuthController(authService);
const profileController = new ProfileController(profileService);
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);
const inventoryController = new InventoryController(inventoryService);
const saleController = new SaleController(saleService);
const dashboardController = new DashboardController(dashboardService);
const analyticsController = new AnalyticsController(analyticsService);
const reportsController = new ReportsController(reportsService);
const settingsController = new SettingsController(settingsService);
const notificationController = new NotificationController(notificationService);

// 4. Setup Express
const app = express();

app.use(cors({ 
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(config.cookieSecret));

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const requireAuth = createAuthMiddleware(sessionRepo, userRepo);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Stock Inventra API is healthy' });
});

// Mount Routers
app.use('/api/v1/auth', createAuthRouter(authController, requireAuth));
app.use('/api/v1/profile', createProfileRouter(profileController, requireAuth));
app.use('/api/v1/products', createProductRouter(productController, requireAuth));
app.use('/api/v1/categories', createCategoryRouter(categoryController, requireAuth));
app.use('/api/v1/inventory', createInventoryRouter(inventoryController, requireAuth));
app.use('/api/v1/sales', createSaleRouter(saleController, requireAuth));
app.use('/api/v1/dashboard', createDashboardRouter(dashboardController, requireAuth));
app.use('/api/v1/analytics', createAnalyticsRouter(analyticsController, requireAuth));
app.use('/api/v1/reports', createReportsRouter(reportsController, requireAuth));
app.use('/api/v1/settings', createSettingsRouter(settingsController, requireAuth));
app.use('/api/v1/notifications', createNotificationRouter(notificationController, requireAuth));

// Global Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
