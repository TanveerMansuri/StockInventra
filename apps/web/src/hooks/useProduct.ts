import { useState, useEffect } from "react";
import { productsService } from "../services/api";
import { Product } from "@stock-inventra/types";

export function useProduct(id: string) {
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = () => {
    setIsLoading(true);
    productsService.getProduct(id)
      .then(res => {
        if(res.success) setData(res.data);
        else setError("Product not found");
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if(id) fetchProduct();
  }, [id]);

  return { data, isLoading, error, refetch: fetchProduct };
}
