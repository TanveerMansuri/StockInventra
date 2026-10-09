import { useState, useEffect } from "react";
import { salesService } from "../services/api";
import { Sale } from "@stock-inventra/types";

export function useSales(params: any = {}) {
  const [data, setData] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await salesService.getSales(params);
      if (res.success) {
        setData(res.data);
        setTotal(res.meta?.total || 0);
      } else {
        setError("Failed to fetch sales");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [JSON.stringify(params)]);

  return { data, total, isLoading, error, refetch: fetchSales };
}
