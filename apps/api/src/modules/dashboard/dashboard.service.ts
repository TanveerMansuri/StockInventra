import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";

export class DashboardService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository
  ) {}

  async getDashboardData(period: string) {
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    let totalRevenue = 0;
    let totalProfit = 0;
    
    // Simplistic aggregation for Phase 07
    sales.forEach(sale => {
      totalRevenue += sale.finalAmount;
      totalProfit += sale.grossProfit;
    });

    const totalProducts = products.length;
    const currentStock = products.reduce((acc, p) => acc + p.currentStock, 0);

    return {
      totalRevenue,
      totalProfit,
      totalProducts,
      currentStock,
      revenueTrend: 12.5, // Mocked for phase 07
      profitTrend: 8.2,   // Mocked for phase 07
      topSellingProducts: [] // Mocked for phase 07
    };
  }
}
