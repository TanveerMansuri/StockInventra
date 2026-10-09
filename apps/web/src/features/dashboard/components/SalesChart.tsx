import { Card, CardHeader, CardTitle, CardContent } from "@stock-inventra/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

export function SalesChart({ data = [] }: { data?: any[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Sales & Profit Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 h-[280px] flex flex-col pt-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center bg-[#FDF9F5] rounded-md mx-[4px] mb-[4px]">
            <Activity className="h-[28px] w-[28px] text-[#781529] opacity-40 mb-[8px]" />
            <p className="text-[14px] font-semibold text-[#3C3834]">No chart data available</p>
            <p className="text-[12px] text-[#77706D] mt-[2px]">Data will populate as sales occur.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', borderRadius: '8px', border: '1px solid rgb(var(--color-border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '14px', fontWeight: 500 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
              <Line type="monotone" name="Revenue" dataKey="revenue" stroke="rgb(var(--color-primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Profit" dataKey="profit" stroke="rgb(var(--color-text-secondary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
