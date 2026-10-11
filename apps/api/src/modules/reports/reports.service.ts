import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";
import { InventoryRepository, StockMovementRepository } from "../inventory/inventory.repository";

export class ReportsService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository,
    private invRepo: InventoryRepository,
    private movRepo: StockMovementRepository
  ) {}

  private parseDateRange(query: any) {
    const period = query.period || "thisMonth";
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "yesterday") {
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    } else if (period === "thisWeek") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const sunday = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
    } else if (period === "lastWeek") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const sunday = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
    } else if (period === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === "lastMonth") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === "thisYear") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "custom" && query.startDate && query.endDate) {
      const [sYear, sMonth, sDay] = String(query.startDate).split("-").map(Number);
      const [eYear, eMonth, eDay] = String(query.endDate).split("-").map(Number);
      start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
      end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return { start, end };
  }

  private isWithin(dateVal: any, start: Date, end: Date) {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return false;
    return d >= start && d <= end;
  }

  async getSalesReport(query: any) {
    const { start, end } = this.parseDateRange(query);
    const allSales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const sales = allSales.filter(s => this.isWithin(s.createdAt, start, end));
    
    const summary = {
      transactionCount: sales.length,
      unitsSold: 0,
      subtotal: 0,
      discounts: 0,
      finalAmount: 0
    };
    
    const details = sales.map(sale => {
      let saleUnits = 0;
      if (sale.items) {
        saleUnits = sale.items.reduce((sum: any, i: any) => sum + i.quantity, 0);
      }
      summary.unitsSold += saleUnits;
      summary.subtotal += sale.subtotal;
      summary.discounts += sale.discount;
      summary.finalAmount += sale.finalAmount;
      
      return {
        id: sale.id,
        timestamp: sale.createdAt,
        itemsCount: sale.items?.length || 0,
        units: saleUnits,
        subtotal: sale.subtotal,
        discount: sale.discount,
        finalAmount: sale.finalAmount
      };
    });

    return { summary, details };
  }

  async getProfitReport(query: any) {
    const { start, end } = this.parseDateRange(query);
    const allSales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const sales = allSales.filter(s => this.isWithin(s.createdAt, start, end));
    
    let netSales = 0;
    let cogs = 0;
    let grossProfit = 0;
    
    const details = sales.map(sale => {
      netSales += sale.finalAmount;
      cogs += sale.totalCost;
      grossProfit += sale.grossProfit;
      
      return {
        id: sale.id,
        timestamp: sale.createdAt,
        netSales: sale.finalAmount,
        costOfGoodsSold: sale.totalCost,
        grossProfit: sale.grossProfit,
        marginPercent: sale.finalAmount > 0 ? (sale.grossProfit / sale.finalAmount) * 100 : 0
      };
    });

    const marginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    return { 
      summary: { netSales, costOfGoodsSold: cogs, grossProfit, marginPercent },
      details 
    };
  }

  async getInventoryReport(query: any) {
    const { start, end } = this.parseDateRange(query);
    const products = await this.prodRepo.findMany({});
    
    let totalOpeningValuation = 0;
    let totalClosingValuation = 0;
    
    const details = await Promise.all(products.map(async p => {
      const allMovs = await this.movRepo.findMany({ productId: p.id });
      
      let openingStock = p.initialStock;
      let receipts = 0;
      let sold = 0;
      let adjustments = 0;
      
      const prevMovs = allMovs.filter((m: any) => new Date(m.createdAt) < start);
      for (const m of prevMovs) {
        if (m.type === "PURCHASE" || m.type === "RETURN") openingStock += m.quantity;
        else if (m.type === "SALE") openingStock -= Math.abs(m.quantity);
        else if (m.type === "ADJUSTMENT") openingStock += m.quantity;
      }
      
      const periodMovs = allMovs.filter((m: any) => this.isWithin(m.createdAt, start, end));
      for (const m of periodMovs) {
        if (m.type === "PURCHASE" || m.type === "RETURN") receipts += m.quantity;
        else if (m.type === "SALE") sold += Math.abs(m.quantity);
        else if (m.type === "ADJUSTMENT") adjustments += m.quantity;
      }
      
      const closingStock = openingStock + receipts - sold + adjustments;
      
      totalOpeningValuation += openingStock * p.purchasePrice;
      totalClosingValuation += closingStock * p.purchasePrice;
      
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        costPrice: p.purchasePrice,
        openingStock,
        receipts,
        sold,
        adjustments,
        closingStock,
        openingValuation: openingStock * p.purchasePrice,
        closingValuation: closingStock * p.purchasePrice
      };
    }));

    return { 
      summary: { totalOpeningValuation, totalClosingValuation },
      details 
    };
  }

  async getProductPerformanceReport(query: any) {
    const { start, end } = this.parseDateRange(query);
    const allSales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const sales = allSales.filter(s => this.isWithin(s.createdAt, start, end));
    const products = await this.prodRepo.findMany({});
    
    const productStats = new Map();
    products.forEach(p => {
      productStats.set(p.id, { 
        id: p.id, name: p.name, sku: p.sku, 
        currentStock: p.currentStock, 
        lowStockThreshold: p.lowStockThreshold,
        unitsSold: 0, revenue: 0, profit: 0 
      });
    });
    
    sales.forEach(s => {
      if (s.items) {
        s.items.forEach((i: any) => {
          if (productStats.has(i.productId)) {
            const stat = productStats.get(i.productId);
            stat.unitsSold += i.quantity;
            stat.revenue += i.finalAmount;
            const p = products.find(prod => prod.id === i.productId);
            if (p) {
              stat.profit += i.finalAmount - (p.purchasePrice * i.quantity);
            }
          }
        });
      }
    });
    
    const details = Array.from(productStats.values()).map(stat => {
      let status = "NORMAL";
      if (stat.currentStock <= 0) status = "OUT_OF_STOCK";
      else if (stat.currentStock <= stat.lowStockThreshold) status = "LOW_STOCK";
      
      return { ...stat, status };
    });
    
    details.sort((a, b) => b.unitsSold - a.unitsSold);
    
    return { summary: { totalProducts: details.length }, details };
  }

  generateCsv(data: any[]): string {
    if (data.length === 0) return "";
    
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (/^[=+\-@]/.test(str)) str = "'" + str;
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => escapeCsv(row[h])).join(","));
    return [headers.join(","), ...rows].join("\n");
  }
}
