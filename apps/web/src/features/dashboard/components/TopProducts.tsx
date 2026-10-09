import { Card, CardHeader, CardTitle, CardContent } from "@stock-inventra/ui";
import { Package } from "lucide-react";

interface TopProductProps {
  id: string;
  name: string;
  category?: string;
  unitsSold?: number;
  revenue: number;
  image?: string;
}

export function TopProducts({ products = [] }: { products?: TopProductProps[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="flex flex-col gap-[12px] flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center bg-[#FDF9F5] rounded-md mx-[4px] mb-[4px]">
              <Package className="h-[28px] w-[28px] text-[#781529] opacity-40 mb-[8px]" />
              <p className="text-[14px] font-semibold text-[#3C3834]">No products sold</p>
              <p className="text-[12px] text-[#77706D] mt-[2px]">Top products will appear here once sales are recorded.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b border-border pb-12 last:border-0 last:pb-0">
                <div className="flex items-center gap-12">
                  <div className="flex h-48 w-48 items-center justify-center rounded-md bg-background text-2xl">
                    {product.image || product.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-strong">{product.name}</p>
                    <p className="text-small text-text-secondary">{product.category || "General"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body-strong font-semibold">₹{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  {product.unitsSold !== undefined && <p className="text-small text-text-secondary">{product.unitsSold} units</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
