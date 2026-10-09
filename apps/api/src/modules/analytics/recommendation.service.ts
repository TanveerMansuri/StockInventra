export class AnalyticsStockRecommendationService {
  recommend(currentStock: number, lowStockThreshold: number, salesVelocity: number): "INCREASE" | "MAINTAIN" | "REDUCE" {
    // Basic logic
    if (currentStock <= lowStockThreshold && salesVelocity > 0) return "INCREASE";
    if (currentStock > lowStockThreshold * 3 && salesVelocity < 5) return "REDUCE";
    return "MAINTAIN";
  }
}
