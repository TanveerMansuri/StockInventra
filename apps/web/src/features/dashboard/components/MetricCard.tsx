
import { Card } from "@stock-inventra/ui";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
  direction: "up" | "down";
  comparison: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  direction, 
  comparison,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary"
}: MetricCardProps) {
  const isPositive = direction === "up";
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? "text-semantic-success" : "text-semantic-error";

  return (
    <Card className="flex flex-col h-[112px] p-[16px] shadow-sm border border-[#EAE5E0] rounded-[8px] bg-white">
      <div className="flex items-center gap-[12px] mb-auto">
        <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${iconBgColor}`}>
          <Icon className={`h-[20px] w-[20px] ${iconColor}`} strokeWidth={2} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#77706D] leading-[18px] truncate">{title}</p>
          <h3 className="text-[25px] font-bold text-[#242124] leading-[30px] truncate">{value}</h3>
        </div>
      </div>
      <div className="flex items-center text-[12px] mt-[10px]">
        <span className={`flex items-center font-semibold ${trendColor} leading-[18px]`}>
          <TrendIcon className="h-[14px] w-[14px] mr-[4px] stroke-[2.5]" />
          {Math.abs(trend)}%
        </span>
        <span className="ml-[6px] text-[#77706D] leading-[18px] truncate">{comparison}</span>
      </div>
    </Card>
  );
}
