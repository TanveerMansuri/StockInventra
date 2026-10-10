import { useState, useEffect } from "react";
import { dashboardService } from "../services/api";

export function useDashboard(params: any = {}) {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    dashboardService.getDashboardData(params)
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to load dashboard data");
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
