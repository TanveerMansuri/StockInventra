import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/api";
import { AppSettings } from "@stock-inventra/types";

let cachedSettingsPromise: Promise<any> | null = null;
let cachedSettingsData: AppSettings | null = null;
const listeners = new Set<(data: AppSettings | null) => void>();

export function updateCachedSettings(newData: AppSettings | null) {
  cachedSettingsData = newData;
  listeners.forEach((listener) => listener(newData));
}

export function invalidateSettingsCache() {
  cachedSettingsData = null;
  cachedSettingsPromise = null;
}

export function useSettings() {
  const [data, setData] = useState<AppSettings | null>(cachedSettingsData);
  const [isLoading, setIsLoading] = useState(!cachedSettingsData);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (force = false) => {
    if (force) {
      invalidateSettingsCache();
    }
    
    if (cachedSettingsData && !force) {
      setData(cachedSettingsData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (!cachedSettingsPromise || force) {
      cachedSettingsPromise = settingsService.getSettings();
    }

    try {
      const res = await cachedSettingsPromise;
      if (res && res.success) {
        updateCachedSettings(res.data);
        setError(null);
      } else {
        setError("Failed to fetch settings");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching settings");
    } finally {
      setIsLoading(false);
      cachedSettingsPromise = null;
    }
  }, []);

  useEffect(() => {
    const handleDataChange = (newData: AppSettings | null) => {
      setData(newData);
    };
    
    listeners.add(handleDataChange);
    
    if (!cachedSettingsData && !cachedSettingsPromise) {
      fetchSettings();
    } else if (cachedSettingsData) {
      setData(cachedSettingsData);
      setIsLoading(false);
    }
    
    return () => {
      listeners.delete(handleDataChange);
    };
  }, [fetchSettings]);

  return { 
    data, 
    isLoading, 
    error, 
    setData: updateCachedSettings, 
    refetch: () => fetchSettings(true) 
  };
}
