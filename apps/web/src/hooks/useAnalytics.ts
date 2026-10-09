import { useState, useEffect } from "react";
import { analyticsService } from "../services/api";

export function useAnalytics(params: any = {}) {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    analyticsService.getAnalytics(params)
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to fetch analytics");
        }
      })
      .catch((err) => {
        setError(err.message || "An error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [JSON.stringify(params)]);

  return { data, isLoading, error };
}
