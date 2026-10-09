import { useState, useEffect } from "react";
import { categoriesService } from "../services/api";
import { Category } from "@stock-inventra/types";

export function useCategories(params: any = {}) {
  const [data, setData] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesService.getCategories(params);
      if (res.success) {
        setData(res.data);
        setTotal(res.meta?.total || 0);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [JSON.stringify(params)]);

  return { data, total, isLoading, error, refetch: fetchCategories };
}
