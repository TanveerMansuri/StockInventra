import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";
import { AnalyticsStockRecommendationService } from "./recommendation.service";

export class AnalyticsService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository,
    private recService: AnalyticsStockRecommendationService
  ) {}

  async getAnalytics(query: any) {
    const period = query.period;
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredSales = sales;
    if (period && period !== "all") {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        if (period === "today") return saleDate >= startOfToday;
        if (period === "7days") return saleDate >= new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (period === "30days") return saleDate >= new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (period === "thisMonth") return saleDate >= new Date(now.getFullYear(), now.getMonth(), 1);
        if (period === "lastMonth") {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          return saleDate >= startOfLastMonth && saleDate <= endOfLastMonth;
        }
        return true;
      });
    }

    let totalSales = 0;
    let totalProfit = 0;
    let unitsSold = 0;

    filteredSales.forEach(sale => {
      totalSales += sale.finalAmount;
      totalProfit += sale.grossProfit;
      if (sale.items) {
        sale.items.forEach(item => unitsSold += item.quantity);
      }
    });

    const averageOrderValue = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

    const productStats = new Map();
    filteredSales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (!productStats.has(item.productId)) {
            productStats.set(item.productId, { unitsSold: 0, revenue: 0 });
          }
          const stat = productStats.get(item.productId);
          stat.unitsSold += item.quantity;
          stat.revenue += item.finalAmount;
        });
      }
    });

    const topSellingProducts = Array.from(productStats.entries())
      .map(([productId, stat]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || "Unknown Product",
          category: product?.categoryId ? "Category" : "General",
          unitsSold: stat.unitsSold,
          revenue: stat.revenue,
          image: product?.image
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold) // Sort by units for analytics
      .slice(0, 5);

    const salesDataMap = new Map();
    filteredSales.forEach(sale => {
      const date = new Date(sale.createdAt);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!salesDataMap.has(dateStr)) {
        salesDataMap.set(dateStr, { label: dateStr, date, revenue: 0, profit: 0 });
      }
      const existing = salesDataMap.get(dateStr);
      existing.revenue += sale.finalAmount;
      existing.profit += sale.grossProfit;
    });
    
    const salesData = Array.from(salesDataMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ label, revenue, profit }) => ({ label, revenue, profit }));

    const stockRecommendations = products.map(p => {
      const recResult = this.recService.recommend(p.currentStock, p.lowStockThreshold, 10);
      let reason = "Stock levels are optimal for current velocity.";
      let type = "maintain";
      
      if (recResult === "INCREASE") {
        reason = "Stock is near or below threshold with active sales.";
        type = "increase";
      } else if (recResult === "REDUCE") {
        reason = "Stock is over 3x threshold with low sales velocity.";
        type = "reduce";
      }

      return {
        productId: p.id,
        product: p.name,
        reason,
        action: recResult,
        type
      };
    });

    return {
      totalSales,
      totalProfit,
      unitsSold,
      averageOrderValue,
      revenueTrend: 0,
      profitTrend: 0,
      topSellingProducts,
      salesData,
      stockRecommendations
    };
  }
}
