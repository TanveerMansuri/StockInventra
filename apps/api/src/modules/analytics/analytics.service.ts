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
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    let totalSales = 0;
    let totalProfit = 0;
    let unitsSold = 0;

    sales.forEach(sale => {
      totalSales += sale.finalAmount;
      totalProfit += sale.grossProfit;
      sale.items.forEach(item => unitsSold += item.quantity);
    });

    const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;

    const stockRecommendations = products.map(p => ({
      productId: p.id,
      name: p.name,
      recommendation: this.recService.recommend(p.currentStock, p.lowStockThreshold, 10) // mock sales velocity
    }));

    return {
      totalSales,
      totalProfit,
      unitsSold,
      averageOrderValue,
      revenueTrend: [], // mock
      topSellingProducts: [], // mock
      stockRecommendations
    };
  }
}
