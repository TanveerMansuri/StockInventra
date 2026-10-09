/**
 * API Client Foundation
 * Configured for future backend integration using VITE_API_BASE_URL.
 * Supports secure cookie-based authentication via `credentials: 'include'`.
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...customConfig.headers,
    },
    // Required for secure cookie authentication
    credentials: "include", 
  };

  if (customConfig.body && typeof customConfig.body === 'object') {
    config.body = JSON.stringify(customConfig.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        response.status, 
        data?.message || "An unexpected error occurred", 
        data?.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error or server is unreachable");
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: "POST", body: data }),
    
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: "PATCH", body: data }),
    
  put: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: "PUT", body: data }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
