export const dashboardMetrics = {
  totalRevenue: {
    value: 124580,
    trend: 12.5,
    direction: "up" as const,
    comparison: "from last month"
  },
  totalProfit: {
    value: 42360,
    trend: 18.2,
    direction: "up" as const,
    comparison: "from last month"
  },
  totalProducts: {
    value: 128,
    trend: 5,
    direction: "up" as const,
    comparison: "new this month"
  },
  currentStock: {
    value: 2480,
    trend: -8.3,
    direction: "down" as const,
    comparison: "from last month"
  }
};

export const salesChartData = [
  { month: "Nov", revenue: 45000, profit: 12000 },
  { month: "Dec", revenue: 52000, profit: 15000 },
  { month: "Jan", revenue: 38000, profit: 10000 },
  { month: "Feb", revenue: 65000, profit: 22000 },
  { month: "Mar", revenue: 72000, profit: 26000 },
  { month: "Apr", revenue: 84000, profit: 32000 }
];

export const topProducts = [
  { id: "1", name: "Premium Coffee Beans", category: "Beverages", unitsSold: 320, revenue: 48000, image: "☕" },
  { id: "2", name: "Wireless Keyboard", category: "Electronics", unitsSold: 245, revenue: 36750, image: "⌨️" },
  { id: "3", name: "Cotton T-Shirt", category: "Apparel", unitsSold: 180, revenue: 27000, image: "👕" },
  { id: "4", name: "Ceramic Mug", category: "Home & Kitchen", unitsSold: 160, revenue: 19200, image: "🍵" },
  { id: "5", name: "Leather Wallet", category: "Accessories", unitsSold: 140, revenue: 38000, image: "👛" }
];
