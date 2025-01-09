// src/client/base.ts

/**
 * Configuration options for TsForge client
 */
export interface TsForgeConfig {
    baseUrl: string;
    schemas?: string[];
    defaultHeaders?: Record<string, string>;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      backoff: number;
    };
  }
  
  /**
   * Custom error class for TsForge operations
   */
  export class TsForgeError extends Error {
    constructor(
      message: string,
      public code: string,
      public status?: number,
      public details?: unknown
    ) {
      super(message);
      this.name = 'TsForgeError';
    }
  }
  
  /**
   * Base request options extending the standard RequestInit
   */
  export interface BaseRequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
    timeout?: number;
  }
  
  /**
   * Base client class for handling HTTP requests
   */
  export class BaseClient {
    private readonly config: TsForgeConfig;
  
    constructor(config: TsForgeConfig) {
      this.config = {
        timeout: 30000, // Default 30s timeout
        ...config,
        defaultHeaders: {
          'Content-Type': 'application/json',
          ...config.defaultHeaders,
        },
      };
    }
  
    /**
     * Builds the full URL including query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
      const url = new URL(endpoint, this.config.baseUrl);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      return url.toString();
    }
  
    /**
     * Handles the fetch request with timeout and retries
     */
    private async fetchWithTimeout(
      url: string,
      options: RequestInit,
      timeout: number
    ): Promise<Response> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
  
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  
    /**
     * Main request method with retry logic
     */
    async request<T>(
      endpoint: string,
      options: BaseRequestOptions = {}
    ): Promise<T> {
      const { params, timeout = this.config.timeout, ...fetchOptions } = options;
      const url = this.buildUrl(endpoint, params);
      let attempts = 0;
      const maxRetries = this.config.retryConfig?.maxRetries ?? 3;
  
      while (attempts < maxRetries) {
        try {
          const response = await this.fetchWithTimeout(
            url,
            {
              ...fetchOptions,
              headers: {
                ...this.config.defaultHeaders,
                ...fetchOptions.headers,
              },
            },
            timeout ?? 30000
          );
  
          if (!response.ok) {
            throw new TsForgeError(
              `HTTP error: ${response.statusText}`,
              'HTTP_ERROR',
              response.status,
              await response.json().catch(() => undefined)
            );
          }
  
          return await response.json();
        } catch (error) {
          attempts++;
          if (attempts === maxRetries) {
            throw error instanceof TsForgeError
              ? error
              : new TsForgeError(
                  String(error),
                  'REQUEST_FAILED',
                  undefined,
                  error
                );
          }
  
          // Wait before retrying using exponential backoff
          const backoff = (this.config.retryConfig?.backoff ?? 1000) * Math.pow(2, attempts - 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
  
      // This should never be reached due to the throw in the catch block
      throw new TsForgeError('Request failed', 'REQUEST_FAILED');
    }
  
    /**
     * HTTP GET request
     */
    async get<T>(endpoint: string, options: BaseRequestOptions = {}): Promise<T> {
      return this.request<T>(endpoint, { ...options, method: 'GET' });
    }
  
    /**
     * HTTP POST request
     */
    async post<T>(endpoint: string, data?: unknown, options: BaseRequestOptions = {}): Promise<T> {
      return this.request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    }
  
    /**
     * HTTP PUT request
     */
    async put<T>(endpoint: string, data?: unknown, options: BaseRequestOptions = {}): Promise<T> {
      return this.request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    }
  
    /**
     * HTTP DELETE request
     */
    async delete<T>(endpoint: string, options: BaseRequestOptions = {}): Promise<T> {
      return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
  }
  
  // Export default instance creator
  export function createBaseClient(config: TsForgeConfig): BaseClient {
    return new BaseClient(config);
  }