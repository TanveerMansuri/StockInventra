import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";
import { AnalyticsStockRecommendationService } from "./recommendation.service";

export interface AnalyticsTimelinePoint {
  label: string;
  tooltipLabel: string;
  tickLabel?: string;
  showTick?: boolean;
  revenue: number;
  profit: number;
}

export class AnalyticsService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository,
    private recService: AnalyticsStockRecommendationService
  ) {}

  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }

  async getAnalytics(query: any) {
    const period = query.period || "thisMonth";
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let bucketMode: "hourly24" | "weekDaily" | "monthDaily" | "yearMonthly" | "custom" = "monthDaily";

    if (period === "today") {
      start = startOfToday;
      end = endOfToday;
      prevStart = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      prevEnd = new Date(startOfToday.getTime() - 1);
      bucketMode = "hourly24";
    } else if (period === "thisWeek") {
      const day = startOfToday.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start = new Date(now.getFullYear(), now.getMonth(), startOfToday.getDate() + diffToMonday, 0, 0, 0, 0);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
      prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(start.getTime() - 1);
      bucketMode = "weekDaily";
    } else if (period === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      bucketMode = "monthDaily";
    } else if (period === "thisYear") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      bucketMode = "yearMonthly";
    } else if (period === "custom" && query.startDate && query.endDate) {
      const parsedStart = this.parseLocalDate(query.startDate) || startOfToday;
      const parsedEnd = this.parseLocalDate(query.endDate) || endOfToday;

      start = parsedStart;
      end = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);

      const durationMs = end.getTime() - start.getTime() + 1;
      prevStart = new Date(start.getTime() - durationMs);
      prevEnd = new Date(start.getTime() - 1);
      bucketMode = "custom";
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      bucketMode = "monthDaily";
    }

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });

    const prevSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= prevStart && saleDate <= prevEnd;
    });

    let totalSales = 0;
    let totalProfit = 0;
    let unitsSold = 0;

    filteredSales.forEach((sale) => {
      totalSales += sale.finalAmount;
      totalProfit += sale.grossProfit;
      if (sale.items) {
        sale.items.forEach((item) => (unitsSold += item.quantity));
      }
    });

    let prevSalesAmount = 0;
    let prevProfit = 0;
    prevSales.forEach((sale) => {
      prevSalesAmount += sale.finalAmount;
      prevProfit += sale.grossProfit;
    });

    const calcTrend = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenueTrend = calcTrend(totalSales, prevSalesAmount);
    const profitTrend = calcTrend(totalProfit, prevProfit);

    const averageOrderValue = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

    const productStats = new Map<string, { unitsSold: number; revenue: number }>();
    filteredSales.forEach((sale) => {
      if (sale.items) {
        sale.items.forEach((item) => {
          if (!productStats.has(item.productId)) {
            productStats.set(item.productId, { unitsSold: 0, revenue: 0 });
          }
          const stat = productStats.get(item.productId)!;
          stat.unitsSold += item.quantity;
          stat.revenue += item.finalAmount;
        });
      }
    });

    const topSellingProducts = Array.from(productStats.entries())
      .map(([productId, stat]) => {
        const product = products.find((p) => p.id === productId);
        return {
          id: productId,
          name: product?.name || "Unknown Product",
          category: product?.categoryId ? "Category" : "General",
          unitsSold: stat.unitsSold,
          revenue: Math.round(stat.revenue * 100) / 100,
          image: product?.image,
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const salesData: AnalyticsTimelinePoint[] = [];

    if (bucketMode === "hourly24") {
      const hourBuckets: {
        hour: number;
        label: string;
        tooltipLabel: string;
        showTick: boolean;
        revenue: number;
        profit: number;
      }[] = [];

      for (let h = 0; h < 24; h++) {
        const periodStr = h >= 12 ? "PM" : "AM";
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const tickStr = `${displayH} ${periodStr}`;
        const tooltipStr = `${displayH}:00 ${periodStr}`;
        const showTick = h % 2 === 0;

        hourBuckets.push({
          hour: h,
          label: tickStr,
          tooltipLabel: tooltipStr,
          showTick,
          revenue: 0,
          profit: 0,
        });
      }

      filteredSales.forEach((sale) => {
        const saleDate = new Date(sale.createdAt);
        const saleHour = saleDate.getHours();
        if (hourBuckets[saleHour]) {
          hourBuckets[saleHour].revenue += sale.finalAmount;
          hourBuckets[saleHour].profit += sale.grossProfit;
        }
      });

      hourBuckets.forEach((b) => {
        salesData.push({
          label: b.label,
          tooltipLabel: b.tooltipLabel,
          tickLabel: b.showTick ? b.label : "",
          showTick: b.showTick,
          revenue: Math.round(b.revenue * 100) / 100,
          profit: Math.round(b.profit * 100) / 100,
        });
      });
    } else if (bucketMode === "weekDaily") {
      const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const curDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + i);
        const dayName = weekdays[i];
        const dateStr = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const tooltipLabel = `${dayName}, ${dateStr}`;

        const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999);

        let dayRev = 0;
        let dayProf = 0;
        filteredSales.forEach((sale) => {
          const sDate = new Date(sale.createdAt);
          if (sDate >= dayStart && sDate <= dayEnd) {
            dayRev += sale.finalAmount;
            dayProf += sale.grossProfit;
          }
        });

        salesData.push({
          label: dayName,
          tooltipLabel,
          tickLabel: dayName,
          showTick: true,
          revenue: Math.round(dayRev * 100) / 100,
          profit: Math.round(dayProf * 100) / 100,
        });
      }
    } else if (bucketMode === "monthDaily") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthName = now.toLocaleDateString("en-US", { month: "short" });

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), d, 0, 0, 0, 0);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), d, 23, 59, 59, 999);

        let dayRev = 0;
        let dayProf = 0;
        filteredSales.forEach((sale) => {
          const sDate = new Date(sale.createdAt);
          if (sDate >= dayStart && sDate <= dayEnd) {
            dayRev += sale.finalAmount;
            dayProf += sale.grossProfit;
          }
        });

        const showTick = d % 2 !== 0;
        const tickLabel = showTick ? `${monthName} ${d}` : "";
        const tooltipLabel = `${monthName} ${d}, ${now.getFullYear()}`;

        salesData.push({
          label: `${monthName} ${d}`,
          tooltipLabel,
          tickLabel,
          showTick,
          revenue: Math.round(dayRev * 100) / 100,
          profit: Math.round(dayProf * 100) / 100,
        });
      }
    } else if (bucketMode === "yearMonthly") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = now.getFullYear();

      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(currentYear, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(currentYear, m + 1, 0, 23, 59, 59, 999);

        let mRev = 0;
        let mProf = 0;
        filteredSales.forEach((sale) => {
          const sDate = new Date(sale.createdAt);
          if (sDate >= monthStart && sDate <= monthEnd) {
            mRev += sale.finalAmount;
            mProf += sale.grossProfit;
          }
        });

        const label = monthNames[m];
        salesData.push({
          label,
          tooltipLabel: `${label} ${currentYear}`,
          tickLabel: label,
          showTick: true,
          revenue: Math.round(mRev * 100) / 100,
          profit: Math.round(mProf * 100) / 100,
        });
      }
    } else {
      const durationMs = end.getTime() - start.getTime() + 1;
      const diffDays = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000)));

      if (diffDays <= 1) {
        const hourBuckets: {
          hour: number;
          label: string;
          tooltipLabel: string;
          showTick: boolean;
          revenue: number;
          profit: number;
        }[] = [];

        const dayFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        for (let h = 0; h < 24; h++) {
          const periodStr = h >= 12 ? "PM" : "AM";
          const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
          const tickStr = `${displayH} ${periodStr}`;
          const tooltipStr = `${dayFormatted}, ${displayH}:00 ${periodStr}`;
          const showTick = h % 2 === 0;

          hourBuckets.push({
            hour: h,
            label: tickStr,
            tooltipLabel: tooltipStr,
            showTick,
            revenue: 0,
            profit: 0,
          });
        }

        filteredSales.forEach((sale) => {
          const saleDate = new Date(sale.createdAt);
          const saleHour = saleDate.getHours();
          if (hourBuckets[saleHour]) {
            hourBuckets[saleHour].revenue += sale.finalAmount;
            hourBuckets[saleHour].profit += sale.grossProfit;
          }
        });

        hourBuckets.forEach((b) => {
          salesData.push({
            label: b.label,
            tooltipLabel: b.tooltipLabel,
            tickLabel: b.showTick ? b.label : "",
            showTick: b.showTick,
            revenue: Math.round(b.revenue * 100) / 100,
            profit: Math.round(b.profit * 100) / 100,
          });
        });
      } else if (diffDays <= 35) {
        const curDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endLimit = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        let dayIndex = 0;
        while (curDate <= endLimit) {
          const dayStart = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0, 0);
          const dayEnd = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 23, 59, 59, 999);
          const dateStr = curDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          let dRev = 0;
          let dProf = 0;
          filteredSales.forEach((sale) => {
            const sDate = new Date(sale.createdAt);
            if (sDate >= dayStart && sDate <= dayEnd) {
              dRev += sale.finalAmount;
              dProf += sale.grossProfit;
            }
          });

          const showTick = diffDays > 14 ? dayIndex % 2 === 0 : true;

          salesData.push({
            label: dateStr,
            tooltipLabel: dateStr,
            tickLabel: showTick ? dateStr : "",
            showTick,
            revenue: Math.round(dRev * 100) / 100,
            profit: Math.round(dProf * 100) / 100,
          });

          curDate.setDate(curDate.getDate() + 1);
          dayIndex++;
        }
      } else {
        const curDate = new Date(start.getFullYear(), start.getMonth(), 1);
        const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);

        while (curDate <= endLimit) {
          const mStart = new Date(curDate.getFullYear(), curDate.getMonth(), 1, 0, 0, 0, 0);
          const mEnd = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 0, 23, 59, 59, 999);
          const mLabel = curDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

          let mRev = 0;
          let mProf = 0;
          filteredSales.forEach((sale) => {
            const sDate = new Date(sale.createdAt);
            if (sDate >= mStart && sDate <= mEnd) {
              mRev += sale.finalAmount;
              mProf += sale.grossProfit;
            }
          });

          salesData.push({
            label: mLabel,
            tooltipLabel: mLabel,
            tickLabel: mLabel,
            showTick: true,
            revenue: Math.round(mRev * 100) / 100,
            profit: Math.round(mProf * 100) / 100,
          });

          curDate.setMonth(curDate.getMonth() + 1);
        }
      }
    }

    const stockRecommendations = products.map((p) => {
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
        type,
      };
    });

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      unitsSold,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      revenueTrend,
      profitTrend,
      topSellingProducts,
      salesData,
      stockRecommendations,
    };
  }
}
