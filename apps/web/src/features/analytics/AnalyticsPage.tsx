import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
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
      action={
        <div className="flex flex-nowrap overflow-x-auto gap-[8px] pb-2 sm:pb-0 w-full sm:w-auto -mx-16 px-16 sm:mx-0 sm:px-0">
          {[
            { id: "thisMonth", label: "This Month" },
            { id: "last3Months", label: "Last 3 Months" },
            { id: "last6Months", label: "Last 6 Months" },
            { id: "last12Months", label: "Last 12 Months" },
            { id: "custom", label: "Custom Range" },
          ].map((opt) => {
            const isActive = period === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id)}
                className={`flex-shrink-0 flex h-[38px] items-center justify-center rounded-[8px] border px-[16px] text-[13px] leading-[20px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/30 ${
                  opt.id === "custom" ? "min-w-[150px]" : "min-w-[140px]"
                } ${
                  isActive
                    ? "bg-[#781529] text-[#FFFFFF] border-[#781529] font-semibold"
                    : "bg-[#FFFFFF] text-[#77706D] border-[#EAE5E0] font-medium hover:bg-[#FAF5EE]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      }
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
            <SalesChart data={[]} /> {/* Using empty until chart endpoint ready */}
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
