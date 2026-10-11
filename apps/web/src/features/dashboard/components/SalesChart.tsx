import { Card, CardHeader, CardTitle, CardContent } from "@stock-inventra/ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

export interface SalesChartDataPoint {
  label: string;
  tooltipLabel?: string;
  tickLabel?: string;
  showTick?: boolean;
  revenue: number;
  profit: number;
}

interface SalesChartProps {
  data?: SalesChartDataPoint[];
}

// Visual color palette faithfully matching the reference design:
// Reference has:
// 1. Revenue: deep burgundy dot & curve with soft translucent gradient fill underneath
// 2. Profit: warm amber-terracotta dot & curve with soft translucent gradient fill underneath
const COLOR_REVENUE = "#7A1830"; // Rich Burgundy / Wine
const COLOR_PROFIT = "#B86E53";  // Warm Terracotta / Orange Amber (matching reference circle color)
const COLOR_GRID = "#F0EBE6";    // Subtle warm gridline matching card surface
const COLOR_TEXT = "#8E8883";    // Soft muted axis label text

/**
 * Format numbers cleanly on the Y-axis:
 * Matches reference: 0, 20K, 40K, 60K, 80K
 */
function formatYAxisTick(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

/**
 * Custom tooltip with formatted currency and clean card styling
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const currentPoint = payload[0]?.payload as SalesChartDataPoint | undefined;
  const displayTitle = currentPoint?.tooltipLabel || currentPoint?.label || "";

  return (
    <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-lg border border-[#EAE5E0] shadow-lg min-w-[170px]">
      <p className="text-[12px] font-semibold text-[#242124] mb-2 border-b border-[#F0EBE6] pb-1">
        {displayTitle}
      </p>
      {payload.map((entry: any, index: number) => {
        const isRevenue = entry.dataKey === "revenue";
        const color = isRevenue ? COLOR_REVENUE : COLOR_PROFIT;
        return (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[12px] py-0.5">
            <span className="flex items-center gap-1.5 font-medium" style={{ color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
              {entry.name}:
            </span>
            <span className="font-semibold text-[#242124] tabular-nums">
              ₹{Number(entry.value).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Custom dot component matching reference:
 * Small circular dot on points with high-contrast colored ring/center
 */
function RenderChartDot(props: any) {
  const { cx, cy, stroke } = props;
  if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={stroke}
      stroke="#FFFFFF"
      strokeWidth={1.5}
    />
  );
}

function RenderActiveDot(props: any) {
  const { cx, cy, stroke } = props;
  if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5.5}
      fill={stroke}
      stroke="#FFFFFF"
      strokeWidth={2}
    />
  );
}

export function SalesChart({ data = [] }: SalesChartProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  // Compute maximum value in current dataset for dynamic Y-axis scaling
  const maxVal = data.reduce((m, d) => Math.max(m, d.revenue || 0, d.profit || 0), 0);

  // Dynamic Y-axis upper limit with comfortable headroom
  const yDomainMax = maxVal === 0 ? 10000 : Math.ceil((maxVal * 1.15) / 5000) * 5000;

  return (
    <Card className="flex h-full flex-col bg-white border border-[#EAE5E0] rounded-xl shadow-sm">
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-[17px] font-bold text-[#242124] tracking-tight">
            Sales & Profit Overview
          </CardTitle>

          {/* Compact visual legend in header matching reference */}
          <div className="flex items-center gap-4 text-[13px] font-medium text-[#5A5450]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_REVENUE }} />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_PROFIT }} />
              <span>Profit</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px] flex flex-col p-4 pt-0">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center bg-[#FDF9F5] rounded-lg mx-1 my-2">
            <Activity className="h-7 w-7 text-[#781529] opacity-40 mb-2" />
            <p className="text-[14px] font-semibold text-[#3C3834]">No chart data available</p>
            <p className="text-[12px] text-[#77706D] mt-0.5">Data will populate as sales occur.</p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[280px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
              >
                <defs>
                  {/* Revenue soft burgundy gradient matching reference */}
                  <linearGradient id="refRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_REVENUE} stopOpacity={0.22} />
                    <stop offset="90%" stopColor={COLOR_REVENUE} stopOpacity={0.02} />
                  </linearGradient>

                  {/* Profit warm orange/terracotta gradient matching reference */}
                  <linearGradient id="refProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_PROFIT} stopOpacity={0.20} />
                    <stop offset="90%" stopColor={COLOR_PROFIT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                {/* Subtle vertical/horizontal gridlines matching reference */}
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke={COLOR_GRID}
                  vertical={false}
                />

                {/* XAxis with custom tick formatter to respect tickLabel/showTick */}
                <XAxis
                  dataKey="label"
                  axisLine={{ stroke: COLOR_GRID, strokeWidth: 1 }}
                  tickLine={false}
                  tick={{ fill: COLOR_TEXT, fontSize: 11, fontWeight: 500 }}
                  dy={6}
                  interval={0}
                  tickFormatter={(_value, index) => {
                    const item = data[index];
                    if (!item) return "";
                    // If point explicitly controls tick visibility (Today hours, Month alternate days)
                    if (item.showTick !== undefined) {
                      return item.showTick ? item.tickLabel || item.label : "";
                    }
                    return item.tickLabel !== undefined ? item.tickLabel : item.label;
                  }}
                />

                {/* YAxis with zero baseline and dynamic ceiling */}
                <YAxis
                  domain={[0, yDomainMax]}
                  axisLine={{ stroke: COLOR_GRID, strokeWidth: 1 }}
                  tickLine={false}
                  tick={{ fill: COLOR_TEXT, fontSize: 11, fontWeight: 500 }}
                  tickFormatter={formatYAxisTick}
                  width={46}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Smooth curves matching reference with monotone type and subtle dots */}
                <Area
                  type="monotone"
                  name="Revenue"
                  dataKey="revenue"
                  stroke={COLOR_REVENUE}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#refRevenueGradient)"
                  dot={<RenderChartDot stroke={COLOR_REVENUE} />}
                  activeDot={<RenderActiveDot stroke={COLOR_REVENUE} />}
                />

                <Area
                  type="monotone"
                  name="Profit"
                  dataKey="profit"
                  stroke={COLOR_PROFIT}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#refProfitGradient)"
                  dot={<RenderChartDot stroke={COLOR_PROFIT} />}
                  activeDot={<RenderActiveDot stroke={COLOR_PROFIT} />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
