import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { DateRangeFilter } from "../../components/common/DateRangeFilter";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@stock-inventra/ui";
import { CircleDollarSign, TrendingUp, Package, Receipt } from "lucide-react";
import { MetricCard } from "../dashboard/components/MetricCard";
import { SalesChart } from "../dashboard/components/SalesChart";
import { TopProducts } from "../dashboard/components/TopProducts";
import { useAnalytics } from "../../hooks/useAnalytics";

export function AnalyticsPage() {
  const [period, setPeriod] = useState("thisMonth");
  const { data, isLoading, error } = useAnalytics({ period });

  const formatCurrency = (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <PageContainer title="Analytics" description="Loading analytics...">
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Analytics" description="An error occurred">
        <div className="flex h-64 items-center justify-center text-red-500">
          {error || "Failed to load analytics data."}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Analytics"
      description="Get insights into your business performance."
      action={<DateRangeFilter value={period} onChange={setPeriod} />}
    >
      <div className="flex flex-col gap-24">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Sales"
            value={formatCurrency(data.totalSales)}
            icon={CircleDollarSign}
            trend={data.revenueTrend}
            direction={data.revenueTrend >= 0 ? "up" : "down"}
            comparison="vs previous"
          />
          <MetricCard
            title="Total Profit"
            value={formatCurrency(data.totalProfit)}
            icon={TrendingUp}
            trend={data.profitTrend}
            direction={data.profitTrend >= 0 ? "up" : "down"}
            comparison="vs previous"
            iconBgColor="bg-semantic-success-bg"
            iconColor="text-semantic-success"
          />
          <MetricCard
            title="Units Sold"
            value={data.unitsSold.toLocaleString()}
            icon={Package}
            trend={0}
            direction="up"
            comparison=""
            iconBgColor="bg-semantic-info-bg"
            iconColor="text-semantic-info"
          />
          <MetricCard
            title="Avg. Order Value"
            value={formatCurrency(data.averageOrderValue)}
            icon={Receipt}
            trend={0}
            direction="up"
            comparison=""
            iconBgColor="bg-semantic-warning-bg"
            iconColor="text-semantic-warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-24 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart data={data.salesData || []} />
          </div>
          <div className="lg:col-span-1">
            <TopProducts products={data.topSellingProducts} />
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-16">
                {data.stockRecommendations.length === 0 ? (
                  <div className="text-text-secondary text-sm">No recommendations available.</div>
                ) : (
                  data.stockRecommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border pb-12 last:border-0 last:pb-0">
                      <div>
                        <p className="text-body-strong">{rec.product}</p>
                        <p className="text-small text-text-secondary">{rec.reason}</p>
                      </div>
                      <Badge 
                        variant={rec.type === "increase" ? "danger" : rec.type === "reduce" ? "warning" : "success"}
                      >
                        {rec.action}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
