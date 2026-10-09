import { useState, useEffect } from "react";
import { reportsService } from "../services/api";

export function useReports(type: string = "general") {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let promise;
    switch(type) {
      case 'sales': promise = reportsService.getSales(); break;
      case 'profit': promise = reportsService.getProfit(); break;
      case 'inventory': promise = reportsService.getInventory(); break;
      case 'products': promise = reportsService.getProducts(); break;
      default: promise = reportsService.getGeneral(); break;
    }

    promise.then(res => {
      if(res.success) setData(res.data);
      else setError("Failed to fetch reports");
    }).catch(err => setError(err.message))
    .finally(() => setIsLoading(false));
  }, [type]);

  return { data, isLoading, error };
}
