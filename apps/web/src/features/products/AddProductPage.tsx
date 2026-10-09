import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select, Textarea } from "@stock-inventra/ui";
import { productsService, categoriesService } from "../../services/api";
import { Category } from "@stock-inventra/types";

export function AddProductPage() {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [initialStock, setInitialStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [description, setDescription] = useState("");

  // Preview Calculations
  const marginAmount = (purchasePrice * margin) / 100;
  const sellingPrice = purchasePrice + marginAmount;
  const discountAmount = (sellingPrice * discount) / 100;
  const finalPrice = sellingPrice - discountAmount;

  useEffect(() => {
    categoriesService.getCategories({ limit: 100 }).then(res => {
      if (res.success) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await productsService.createProduct({
        name,
        sku,
        categoryId,
        purchasePrice,
        marginPercent: margin,
        discountPercent: discount,
        initialStock,
        lowStockThreshold,
        description: description || undefined,
      });

      if (res.success) {
        navigate("/products");
      } else {
        setError(res.message || "Failed to create product");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Add Product"
      description="Add a new product to your inventory."
    >
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-24 lg:grid-cols-3">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="grid grid-cols-1 gap-24 p-24 sm:grid-cols-2">
              <Input 
                label="Product Name" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Premium Coffee Beans" 
                required 
              />
              <Input 
                label="SKU" 
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="PCB-001" 
                required 
              />
              
              <Select 
                label="Category" 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                options={categories.map(c => ({ label: c.name, value: c.id }))} 
                required
              />
              <Input 
                label="Purchase Price (₹)" 
                type="number" 
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                placeholder="250" 
                required 
                min={0}
              />
              
              <Input 
                label="Margin (%)" 
                type="number" 
                value={margin || ''}
                onChange={(e) => setMargin(Number(e.target.value))}
                placeholder="40" 
                min={0}
              />
              <Input 
                label="Selling Price Preview (₹)" 
                type="number" 
                value={sellingPrice}
                disabled 
              />
              
              <Input 
                label="Initial Stock" 
                type="number" 
                value={initialStock || ''}
                onChange={e => setInitialStock(Number(e.target.value))}
                placeholder="100" 
                min={0}
              />
              <Input 
                label="Low Stock Threshold" 
                type="number" 
                value={lowStockThreshold || ''}
                onChange={e => setLowStockThreshold(Number(e.target.value))}
                placeholder="20" 
                min={0}
              />
              
              <div className="sm:col-span-2">
                <Textarea 
                  label="Description" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="High quality premium coffee beans, 500g pack." 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Calculation Area */}
        <div className="flex flex-col gap-24">
          <Card>
            <CardHeader className="border-b border-border bg-background/50 p-16">
              <CardTitle className="text-body-strong">Price Calculation</CardTitle>
            </CardHeader>
            <CardContent className="p-16">
              <div className="flex flex-col gap-12 text-body">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Purchase Price</span>
                  <span>₹{purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">+ Margin ({margin}%)</span>
                  <span>₹{marginAmount.toFixed(2)}</span>
                </div>
                <div className="my-8 border-t border-border" />
                <div className="flex justify-between font-medium">
                  <span>= Selling Price</span>
                  <span>₹{sellingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-8">
                  <span className="text-text-secondary">- Discount ({discount}%)</span>
                  <span>₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="mt-8 mb-4">
                  <Input 
                    type="number" 
                    placeholder="Discount %" 
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="my-8 border-t border-border" />
                <div className="flex justify-between font-bold text-primary">
                  <span>= Final Sale Price</span>
                  <span>₹{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-16">
            <Button type="button" variant="secondary" onClick={() => navigate("/products")} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

      </form>
    </PageContainer>
  );
}
