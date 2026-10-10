import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";

export class DashboardService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository
  ) {}

  async getDashboardData(query: any) {
    const period = query.period || "thisMonth";
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    if (period === "today") {
      // Keep default
    } else if (period === "thisWeek") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start = new Date(start.setDate(diff));
      start.setHours(0,0,0,0);
    } else if (period === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "custom" && query.startDate && query.endDate) {
      start = new Date(query.startDate);
      start.setHours(0,0,0,0);
      end = new Date(query.endDate);
      end.setHours(0,0,0,0);
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate < end;
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    
    filteredSales.forEach(sale => {
      totalRevenue += sale.finalAmount;
      totalProfit += sale.grossProfit;
    });

    const totalProducts = products.length;
    const currentStock = products.reduce((acc, p) => acc + p.currentStock, 0);

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
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalProfit,
      totalProducts,
      currentStock,
      revenueTrend: 0,
      profitTrend: 0,
      topSellingProducts,
      salesData
    };
  }
}
