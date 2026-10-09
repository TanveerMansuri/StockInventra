import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { useProducts } from "../../hooks/useProducts";
import { salesService } from "../../services/api";
import { Search, ChevronDown } from "lucide-react";

export function NewSalePage() {
  const navigate = useNavigate();
  const { data: products, isLoading: isLoadingProducts } = useProducts({ limit: 1000, status: "IN_STOCK" });
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const product = products.find(p => p.id === selectedProductId);

  // Filter for dropdown
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Frontend calculation for UI preview ONLY
  const sellingPrice = product ? product.sellingPrice : 0;
  const purchasePrice = product ? product.purchasePrice : 0;
  const taxPercent = product?.taxPercent || 0;
  
  const subtotal = sellingPrice * quantity;
  const taxableAmount = subtotal - discount; // discount here is flat ₹
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const finalSaleAmount = taxableAmount + taxAmount;
  
  const totalCost = purchasePrice * quantity;
  const grossProfit = finalSaleAmount - totalCost;
  const profitMargin = finalSaleAmount > 0 ? (grossProfit / finalSaleAmount) * 100 : 0;

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    if (quantity > product.currentStock) {
      setError(`Quantity cannot exceed available stock (${product.currentStock}).`);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    // API expects discount as percentage of subtotal
    const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;

    try {
      // Must match createSaleSchema format: { items: [{ productId, quantity, discount }] }
      const res = await salesService.createSale({
        items: [{
          productId: product.id,
          quantity,
          discount: discountPercent
        }]
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
        <div className="mb-[24px] p-[16px] rounded-[8px] bg-red-50 border border-red-100 text-red-600 text-[14px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSale} className="flex flex-col gap-[16px]">
        <div className="flex flex-col lg:flex-row gap-[16px] items-start">
          
          {/* Main Form Area */}
          <div className="lg:w-[60%] w-full bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] p-[20px] shadow-sm">
            <div className="flex flex-col gap-[16px]">
              
              {/* Row 1: Searchable Product Selector */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[13px] font-medium text-[#242124] mb-[6px]">
                  Select Product <span className="text-[#7A1830]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none">
                    <Search size={16} className="text-[#77706D]" />
                  </div>
                  
                  <div 
                    className="flex items-center w-full min-h-[44px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] pl-[36px] pr-[36px] py-[8px] cursor-pointer focus-within:ring-2 focus-within:ring-[#7A1830]/20 focus-within:border-[#7A1830] transition-colors"
                    onClick={() => setIsDropdownOpen(true)}
                  >
                    {product && !isDropdownOpen ? (
                      <div className="flex items-center gap-[8px]">
                        {product.image ? (
                          <img src={product.image} className="w-[24px] h-[24px] rounded-[4px] object-cover border border-[#EAE5E0]" />
                        ) : (
                          <div className="w-[24px] h-[24px] rounded-[4px] bg-[#F5EFE6] flex items-center justify-center text-[11px] font-bold text-[#7A1830]">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[14px] text-[#242124] font-medium">{product.name} ({product.sku})</span>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder={isLoadingProducts ? "Loading products..." : "Search products by name or SKU..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent outline-none text-[14px] text-[#242124] placeholder:text-[#77706D]"
                      />
                    )}
                  </div>

                  <div className="absolute inset-y-0 right-0 pr-[12px] flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-[#77706D]" />
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-[4px] bg-[#FFFFFF] border border-[#EAE5E0] rounded-[8px] shadow-lg max-h-[250px] flex flex-col overflow-hidden">
                    <div className="overflow-y-auto py-[4px]">
                      {isLoadingProducts ? (
                        <div className="p-[12px] text-center text-[13px] text-[#77706D]">Loading products...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-[12px] text-center text-[13px] text-[#77706D]">No products found.</div>
                      ) : (
                        filteredProducts.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setSearchQuery("");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-[12px] py-[10px] hover:bg-[#F5EFE6] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-[12px]">
                              {p.image ? (
                                <img src={p.image} className="w-[32px] h-[32px] rounded-[6px] object-cover border border-[#EAE5E0]" />
                              ) : (
                                <div className="w-[32px] h-[32px] rounded-[6px] bg-[#FDFCF9] border border-[#EAE5E0] flex items-center justify-center text-[12px] font-bold text-[#7A1830]">
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-[14px] font-medium text-[#242124]">{p.name}</span>
                                <span className="text-[12px] text-[#77706D]">{p.sku}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[14px] font-medium text-[#242124]">₹{p.sellingPrice.toLocaleString()}</span>
                              <span className={`text-[12px] font-medium ${p.currentStock <= p.lowStockThreshold ? 'text-[#D97706]' : 'text-[#059669]'}`}>
                                Stock: {p.currentStock}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Quantity & Selling Price */}
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[13px] font-medium text-[#242124] mb-[6px]">
                    Quantity <span className="text-[#7A1830]">*</span>
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max={product?.currentStock || 1}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full h-[44px] px-[12px] border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] text-[14px] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#242124] mb-[6px]">
                    Selling Price (₹)
                  </label>
                  <input 
                    type="number"
                    value={sellingPrice}
                    disabled
                    className="w-full h-[44px] px-[12px] border border-[#EAE5E0] rounded-[8px] bg-[#FCFCFB] text-[#77706D] text-[14px] outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Discount */}
              <div>
                <label className="block text-[13px] font-medium text-[#242124] mb-[6px]">
                  Discount (₹)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full h-[44px] px-[12px] pr-[50px] border border-[#EAE5E0] rounded-[8px] bg-[#FFFFFF] text-[14px] outline-none focus:border-[#7A1830] focus:ring-1 focus:ring-[#7A1830]/20"
                  />
                  <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[13px] text-[#77706D] pointer-events-none">
                    (or %)
                  </span>
                </div>
              </div>

              {/* Row 4: Final Price Preview */}
              <div className="mt-[4px] bg-[#F5EFE6] rounded-[8px] p-[16px]">
                <div className="text-[13px] font-medium text-[#77706D] mb-[4px]">Final Price (₹)</div>
                <div className="text-[20px] font-bold text-[#7A1830]">{finalSaleAmount.toLocaleString()}</div>
              </div>

            </div>
          </div>

          {/* Sidebar Calculation Area */}
          <div className="lg:w-[40%] w-full bg-[#FFFFFF] rounded-[12px] border border-[#EAE5E0] shadow-sm flex flex-col">
            <div className="p-[16px] border-b border-[#EAE5E0] bg-[#FCFCFB] rounded-t-[12px]">
              <h3 className="text-[16px] font-semibold text-[#242124]">Sale Summary</h3>
            </div>
            <div className="p-[20px] flex flex-col gap-[14px] text-[14px]">
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Quantity</span>
                <span className="text-[#242124] font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Subtotal</span>
                <span className="text-[#242124] font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Discount</span>
                <span className="text-[#242124] font-medium">₹{discount.toFixed(2)}</span>
              </div>
              {taxPercent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[#77706D]">Tax ({taxPercent}%)</span>
                  <span className="text-[#242124] font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="h-[1px] bg-[#EAE5E0] my-[2px]" />
              
              <div className="flex justify-between items-center text-[16px] font-bold text-[#7A1830]">
                <span>Final Sale Amount</span>
                <span>₹{finalSaleAmount.toFixed(2)}</span>
              </div>
              
              <div className="h-[1px] bg-[#EAE5E0] my-[2px]" />
              
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Total Cost</span>
                <span className="text-[#242124] font-medium">₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Gross Profit</span>
                <span className={`font-medium ${grossProfit >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  ₹{grossProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#77706D]">Profit Margin</span>
                <span className={`font-medium ${profitMargin >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Complete Sale Button */}
        <button 
          type="submit" 
          disabled={isSubmitting || !product || quantity > product.currentStock}
          className="w-full h-[44px] mt-[8px] bg-[#7A1830] hover:bg-[#641326] text-[#FFFFFF] font-semibold text-[15px] rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1830]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Complete Sale"}
        </button>

      </form>
    </PageContainer>
  );
}
