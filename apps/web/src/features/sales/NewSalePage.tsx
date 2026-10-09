import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from "@stock-inventra/ui";
import { useProducts } from "../../hooks/useProducts";
import { salesService } from "../../services/api";

export function NewSalePage() {
  const navigate = useNavigate();
  const { data: products, isLoading: isLoadingProducts } = useProducts({ limit: 1000, status: "IN_STOCK" });
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const product = products.find(p => p.id === selectedProductId);

  // Frontend calculation for UI preview ONLY
  const sellingPrice = product ? product.finalPrice : 0;
  const purchasePrice = product ? product.purchasePrice : 0;
  
  const subtotal = sellingPrice * quantity;
  const finalSaleAmount = subtotal - discount;
  const totalCost = purchasePrice * quantity;
  const grossProfit = finalSaleAmount - totalCost;
  const profitMargin = finalSaleAmount > 0 ? (grossProfit / finalSaleAmount) * 100 : 0;

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await salesService.createSale({
        productId: product.id,
        quantity,
        discount
      });
      
      if (res.success) {
        navigate("/sales");
      } else {
        setError(res.message || "Failed to create sale");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="New Sale"
      description="Create a new sale and update inventory."
    >
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSale} className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="grid grid-cols-1 gap-24 p-24 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select 
                  label="Select Product" 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  options={
                    isLoadingProducts 
                    ? [{ label: "Loading products...", value: "" }]
                    : products.map(p => ({ label: `${p.name} (${p.sku}) - Stock: ${p.currentStock}`, value: p.id }))
                  } 
                  required
                />
              </div>
              <Input 
                label="Quantity" 
                type="number" 
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                min="1"
                max={product?.currentStock || 1}
                required 
              />
              <Input 
                label="Selling Price (₹)" 
                type="number" 
                value={sellingPrice}
                disabled 
              />
              <div className="sm:col-span-2">
                <Input 
                  label="Discount (₹)" 
                  type="number" 
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0" 
                  max={subtotal}
                />
              </div>
              <div className="sm:col-span-2">
                <Input 
                  label="Final Price (₹) (Preview)" 
                  type="number" 
                  value={finalSaleAmount}
                  disabled 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Calculation Area */}
        <div className="flex flex-col gap-24">
          <Card>
            <CardHeader className="border-b border-border bg-background/50 p-16">
              <CardTitle className="text-body-strong">Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-16">
              <div className="flex flex-col gap-12 text-body">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-semantic-error">
                  <span>Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
                <div className="my-8 border-t border-border" />
                <div className="flex justify-between font-bold text-primary">
                  <span>Final Sale Amount</span>
                  <span>₹{finalSaleAmount.toFixed(2)}</span>
                </div>
                <div className="my-8 border-t border-border" />
                <div className="flex justify-between text-text-secondary">
                  <span>Total Cost</span>
                  <span>₹{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-semantic-success">
                  <span>Gross Profit Preview</span>
                  <span>₹{grossProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-semantic-success">
                  <span>Profit Margin Preview</span>
                  <span>{profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting || !product || quantity > product.currentStock}>
            {isSubmitting ? "Processing..." : "Complete Sale"}
          </Button>
        </div>

      </form>
    </PageContainer>
  );
}
