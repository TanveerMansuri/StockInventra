export class ProductPricingService {
  calculatePricing(purchasePrice: number, marginPercent: number, discountPercent: number) {
    // We treat percentages straightforwardly: marginPercent = 40 means 40% markup
    const marginAmount = (purchasePrice * marginPercent) / 100;
    const sellingPrice = purchasePrice + marginAmount;
    
    const discountAmount = (sellingPrice * discountPercent) / 100;
    const finalPrice = sellingPrice - discountAmount;
    
    // Returning rounded values for safety, or we could leave them as exact decimals
    return {
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100
    };
  }
  
  determineStatus(currentStock: number, lowStockThreshold: number): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
    if (currentStock <= 0) return "OUT_OF_STOCK";
    if (currentStock <= lowStockThreshold) return "LOW_STOCK";
    return "IN_STOCK";
  }
}
