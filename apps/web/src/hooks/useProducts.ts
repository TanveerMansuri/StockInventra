import { useState, useEffect } from "react";
import { productsService } from "../services/api";
import { Product } from "@stock-inventra/types";

export function useProducts(params: any = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsService.getProducts(params);
      if (res.success) {
        setData(res.data);
        setTotal(res.meta?.total || 0);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  return { data, total, isLoading, error, refetch: fetchProducts };
}
