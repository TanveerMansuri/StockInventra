import { useState, useEffect } from "react";
import { inventoryService } from "../services/api";
import { InventoryItem } from "@stock-inventra/types";

export function useInventory(params: any = {}) {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getInventory(params);
      if (res.success) {
        setData(res.data);
        setTotal(res.meta?.total || 0);
      } else {
        setError("Failed to fetch inventory");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [JSON.stringify(params)]);

  return { data, total, isLoading, error, refetch: fetchInventory };
}
