import { useState, useEffect } from "react";
import { settingsService } from "../services/api";
import { AppSettings } from "@stock-inventra/types";

export function useSettings() {
  const [data, setData] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    settingsService.getSettings()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to fetch settings");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error, setData };
}
