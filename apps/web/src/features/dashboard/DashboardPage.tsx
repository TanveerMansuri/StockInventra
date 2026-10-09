import { useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Select } from "@stock-inventra/ui";
import { IndianRupee, TrendingUp, Package, PackageCheck } from "lucide-react";
import { MetricCard } from "./components/MetricCard";
import { SalesChart } from "./components/SalesChart";
import { TopProducts } from "./components/TopProducts";
import { useDashboard } from "../../hooks/useDashboard";

export function DashboardPage() {
  const [period, setPeriod] = useState("thisMonth");
  const { data, isLoading, error } = useDashboard(period);

  const formatCurrency = (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <PageContainer title="Dashboard" description="Loading your dashboard...">
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Dashboard" description="An error occurred">
        <div className="flex h-64 items-center justify-center text-red-500">
          {error || "Failed to load dashboard data."}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Welcome back! Here's what's happening with your inventory today."
      action={
        <div className="w-[130px] relative">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="!h-[38px] !bg-white !border-[#EAE5E0] !rounded-[8px] !text-[13px] !font-medium !text-[#3C3834] !px-[12px] !pr-[28px] !shadow-sm cursor-pointer appearance-none w-full"
            options={[
              { label: "This Week", value: "thisWeek" },
              { label: "This Month", value: "thisMonth" },
              { label: "Last 3 Months", value: "last3Months" },
              { label: "Last 6 Months", value: "last6Months" },
            ]}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-24">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-24 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            icon={IndianRupee}
            trend={data.revenueTrend}
            direction={data.revenueTrend >= 0 ? "up" : "down"}
            comparison={`from last month`}
            iconBgColor="bg-[#781529]/10"
            iconColor="text-[#781529]"
          />
          <MetricCard
            title="Total Profit"
            value={formatCurrency(data.totalProfit)}
            icon={TrendingUp}
            trend={data.profitTrend}
            direction={data.profitTrend >= 0 ? "up" : "down"}
            comparison={`from last month`}
            iconBgColor="bg-[#D97706]/10"
            iconColor="text-[#D97706]"
          />
          <MetricCard
            title="Total Products"
            value={data.totalProducts.toString()}
            icon={Package}
            trend={0}
            direction="up"
            comparison="total in catalog"
            iconBgColor="bg-[#781529]/10"
            iconColor="text-[#781529]"
          />
          <MetricCard
            title="Current Stock"
            value={data.currentStock.toLocaleString()}
            icon={PackageCheck}
            trend={0}
            direction="up"
            comparison="units available"
            iconBgColor="bg-[#D97706]/10"
            iconColor="text-[#D97706]"
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
      </div>
    </PageContainer>
  );
}
