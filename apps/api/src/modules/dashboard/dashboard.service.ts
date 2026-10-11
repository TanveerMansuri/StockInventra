import { SaleRepository } from "../sales/sale.repository";
import { ProductRepository } from "../products/product.repository";

export interface DashboardTimelinePoint {
  label: string;      // Formatted label for X-axis display or alternate tick
  tooltipLabel: string; // Full high-clarity label for hover tooltip
  tickLabel?: string; // Optional short label for X-axis tick if distinct
  showTick?: boolean; // Whether this point should have a visible tick label on X-axis
  revenue: number;
  profit: number;
}

export class DashboardService {
  constructor(
    private saleRepo: SaleRepository,
    private prodRepo: ProductRepository
  ) {}

  /**
   * Helper to parse a "YYYY-MM-DD" string into a local Date object.
   */
  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }

  async getDashboardData(query: any) {
    const period = query.period || "thisMonth";
    const sales = await this.saleRepo.findMany({ status: "COMPLETED" });
    const products = await this.prodRepo.findMany({});

    const now = new Date();
    // Start of today in local business time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let start: Date;
    let end: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let comparisonLabel: string;
    let bucketMode: "hourly24" | "weekDaily" | "monthDaily" | "yearMonthly" | "custom" = "monthDaily";

    if (period === "today") {
      start = startOfToday;
      end = endOfToday;
      // Previous period: yesterday
      prevStart = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      prevEnd = new Date(startOfToday.getTime() - 1);
      comparisonLabel = "from yesterday";
      bucketMode = "hourly24";
    } else if (period === "thisWeek") {
      // Start of current week (Monday)
      const day = startOfToday.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start = new Date(now.getFullYear(), now.getMonth(), startOfToday.getDate() + diffToMonday, 0, 0, 0, 0);
      // End of current week (Sunday end of day)
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
      // Previous week: 7 days earlier
      prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(start.getTime() - 1);
      comparisonLabel = "from last week";
      bucketMode = "weekDaily";
    } else if (period === "thisMonth") {
      // Start of current month (1st of month 00:00:00)
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      // End of current month
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      // Previous month
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      comparisonLabel = "from last month";
      bucketMode = "monthDaily";
    } else if (period === "thisYear") {
      // Start of current year (Jan 1 00:00:00)
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      // End of current year (Dec 31 23:59:59.999)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      // Previous year
      prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      comparisonLabel = "from last year";
      bucketMode = "yearMonthly";
    } else if (period === "custom" && query.startDate && query.endDate) {
      const parsedStart = this.parseLocalDate(query.startDate) || startOfToday;
      const parsedEnd = this.parseLocalDate(query.endDate) || endOfToday;
      
      start = parsedStart;
      end = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);

      const durationMs = end.getTime() - start.getTime() + 1;
      prevStart = new Date(start.getTime() - durationMs);
      prevEnd = new Date(start.getTime() - 1);
      comparisonLabel = "from previous period";
      bucketMode = "custom";
    } else {
      // Default: thisMonth
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      comparisonLabel = "from last month";
      bucketMode = "monthDaily";
    }

    // Filter sales strictly within current boundaries
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });

    // Filter sales within previous comparison boundaries for trend calculation
    const prevSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= prevStart && saleDate <= prevEnd;
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    filteredSales.forEach((sale) => {
      totalRevenue += sale.finalAmount;
      totalProfit += sale.grossProfit;
    });

    let prevRevenue = 0;
    let prevProfit = 0;
    prevSales.forEach((sale) => {
      prevRevenue += sale.finalAmount;
      prevProfit += sale.grossProfit;
    });

    // Compute trends as percentage
    const calcTrend = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenueTrend = calcTrend(totalRevenue, prevRevenue);
    const profitTrend = calcTrend(totalProfit, prevProfit);

    const totalProducts = products.length;
    const currentStock = products.reduce((acc, p) => acc + p.currentStock, 0);

    // Build timeline buckets
    const salesData: DashboardTimelinePoint[] = [];

    if (bucketMode === "hourly24") {
      // 1. Today: generate all 24 hourly buckets (0 to 23).
      // Display only approximately 12 evenly spaced X-axis labels (even hours: 12 AM, 2 AM, 4 AM, ... 10 PM)
      // All 24 hourly points must be retained in the plotted data.
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

        // Even hours show tick: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22 (12 labels)
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
      // 2. This Week: aggregate by calendar day and label weekdays (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
      const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const curDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() + i);
        const dayName = weekdays[i];
        const dateStr = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const tooltipLabel = `${dayName}, ${dateStr}`;

        // Match sales for this exact calendar day
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
      // 3. This Month: aggregate every calendar day, but display alternate date labels (1, 3, 5, ...).
      // All daily values must still contribute to the chart.
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthName = now.toLocaleDateString("en-US", { month: "short" });

      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(now.getFullYear(), now.getMonth(), d);
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

        // Alternate date labels: Oct 1, Oct 3, Oct 5, ...
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
      // 4. This Year: aggregate January–December by month (12 months).
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
      // 5. Custom Range: respect exact selected start/end dates and choose appropriate interval
      const durationMs = end.getTime() - start.getTime() + 1;
      const diffDays = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000)));

      if (diffDays <= 1) {
        // Single day custom range: 24 hourly buckets
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
        // Multi-day custom range (up to ~1 month): daily buckets
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

          // If more than 14 days, alternate tick labels to prevent label crowding
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
        // Long custom range (> 35 days): monthly buckets
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

    // Top selling products for the selected period
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
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalProducts,
      currentStock,
      revenueTrend,
      profitTrend,
      comparisonLabel,
      topSellingProducts,
      salesData,
    };
  }
}
