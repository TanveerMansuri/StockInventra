import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Input, Select, Textarea } from "@stock-inventra/ui";
import { productsService, categoriesService } from "../../services/api";
import { Category } from "@stock-inventra/types";

export function AddProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [initialStock, setInitialStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [description, setDescription] = useState("");

  // Preview Calculations
  const marginAmount = (purchasePrice * margin) / 100;
  const sellingPrice = purchasePrice + marginAmount;
  const discountAmount = (sellingPrice * discount) / 100;
  const taxableAmount = sellingPrice - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const finalPrice = taxableAmount + taxAmount;

  useEffect(() => {
    categoriesService.getCategories({ limit: 100 }).then(res => {
      if (res.success) {
        setCategories(res.data);
        if (res.data.length > 0 && !isEditMode) {
          setCategoryId(res.data[0].id);
        }
      }
    }).catch(console.error);
    
    if (isEditMode) {
      productsService.getProduct(id!).then(res => {
        if (res.success) {
          const product = res.data;
          setName(product.name);
          setSku(product.sku);
          setCategoryId(product.categoryId);
          setPurchasePrice(product.purchasePrice);
          setMargin(product.marginPercent);
          setDiscount(product.discountPercent);
          setTax(product.taxPercent);
          setInitialStock(product.initialStock); // Map to actual initialStock
          setLowStockThreshold(product.lowStockThreshold);
          setDescription(product.description || "");
        } else {
          setError(res.message || "Failed to load product details");
        }
      }).catch(err => {
        setError(err.message || "Failed to load product details");
      }).finally(() => {
        setIsLoadingProduct(false);
      });
    }
  }, [id, isEditMode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        sku,
        categoryId,
        purchasePrice,
        marginPercent: margin,
        discountPercent: discount,
        taxPercent: tax,
        initialStock,
        lowStockThreshold,
        description: description || undefined,
      };
      
      const res = isEditMode 
        ? await productsService.updateProduct(id!, payload)
        : await productsService.createProduct(payload);

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
      title={isEditMode ? "Edit Product" : "Add Product"}
      description={isEditMode ? "Update an existing product." : "Add a new product to your inventory."}
    >
      {isLoadingProduct && isEditMode ? (
        <div className="py-[40px] text-center text-[#77706D]">Loading product details...</div>
      ) : (
        <>
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-[24px]">
        
        {/* Main Form Area */}
        <div className="flex-grow lg:w-2/3">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] p-[24px] sm:p-[28px] shadow-sm">
            <div className="grid grid-cols-12 gap-x-[16px] gap-y-[20px]">
              <div className="col-span-12 sm:col-span-7">
                <Input 
                  label="Product Name" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Premium Coffee Beans" 
                  required 
                />
              </div>
              <div className="col-span-12 sm:col-span-5">
                <Input 
                  label="SKU" 
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="PCB-001" 
                  required 
                />
              </div>
              
              <div className="col-span-12 sm:col-span-6">
                <Select 
                  label="Category" 
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  options={[
                    { label: "Select category...", value: "" },
                    ...categories.map(c => ({ label: c.name, value: c.id }))
                  ]} 
                  required
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Purchase Price (₹)" 
                  type="number" 
                  value={purchasePrice || ''}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  placeholder="250" 
                  required 
                  min={0}
                />
              </div>
              
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Margin (%)" 
                  type="number" 
                  value={margin || ''}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  placeholder="40" 
                  min={0}
                  required
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Selling Price Preview (₹)" 
                  type="number" 
                  value={sellingPrice}
                  disabled 
                  className="bg-[#FCFCFB] text-[#77706D]"
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Discount (%)" 
                  type="number" 
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0" 
                  min={0}
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Tax (%)" 
                  type="number" 
                  value={tax || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= 100) setTax(val);
                  }}
                  placeholder="0" 
                  min={0}
                  max={100}
                />
              </div>
              
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Initial Stock" 
                  type="number" 
                  value={initialStock === 0 && !initialStock.toString().match(/^0$/) ? '' : initialStock}
                  onChange={e => setInitialStock(Number(e.target.value))}
                  placeholder="100" 
                  required
                  min={0}
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input 
                  label="Low Stock Threshold" 
                  type="number" 
                  value={lowStockThreshold === 0 && !lowStockThreshold.toString().match(/^0$/) ? '' : lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  placeholder="20" 
                  required
                  min={0}
                />
              </div>
              
              <div className="col-span-12">
                <Textarea 
                  label="Description" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="High quality premium coffee beans, 500g pack." 
                  className="min-h-[85px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Calculation Area */}
        <div className="lg:w-1/3 flex flex-col gap-[20px]">
          <div className="bg-[#F5EFE6] rounded-[12px] border border-[#EAE5E0] p-[24px]">
            <h3 className="text-[#242124] text-[17px] font-semibold mb-[20px]">Price Calculation</h3>
            
            <div className="flex flex-col gap-[14px]">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#77706D]">Purchase Price</span>
                <span className="text-[#242124] font-medium">₹{purchasePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#77706D]">Margin ({margin}%)</span>
                <span className="text-[#242124] font-medium">₹{marginAmount.toFixed(2)}</span>
              </div>
              
              <div className="h-[1px] bg-[#EAE5E0] my-[4px]" />
              
              <div className="flex justify-between items-center text-[15px] font-semibold">
                <span className="text-[#242124]">Selling Price</span>
                <span className="text-[#242124]">₹{sellingPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-[14px] mt-[4px]">
                <span className="text-[#77706D]">Discount ({discount}%)</span>
                <span className="text-[#242124] font-medium">₹{discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#77706D]">Tax ({tax}%)</span>
                <span className="text-[#242124] font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              
              <div className="h-[1px] bg-[#EAE5E0] my-[4px]" />
              
              <div className="flex justify-between items-center text-[16px] font-bold text-[#781529]">
                <span>Final Sale Price</span>
                <span>₹{finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-[12px]">
            <button 
              type="button" 
              onClick={() => navigate("/products")} 
              disabled={isSubmitting}
              className="flex items-center justify-center h-[44px] px-[20px] rounded-[8px] bg-[#FFFFFF] border border-[#EAE5E0] text-[#242124] font-medium hover:bg-[#F5EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center h-[44px] px-[20px] rounded-[8px] bg-[#781529] text-[#FFFFFF] font-semibold hover:bg-[#601020] transition-colors focus:outline-none focus:ring-2 focus:ring-[#781529]/50 disabled:opacity-50"
            >
              {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Product" : "Save Product")}
            </button>
          </div>
        </div>

      </form>
      </>
      )}
    </PageContainer>
  );
}
