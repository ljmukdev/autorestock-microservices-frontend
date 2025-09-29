import { ApiRequest, ApiResponse, ApiError } from './types';

export interface FetchClientConfig {
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  onError?: (error: ApiError) => void;
  onRequest?: (request: ApiRequest) => void;
  onResponse?: (response: ApiResponse) => void;
}

export class FetchClient {
  private config: Required<FetchClientConfig>;

  constructor(config: FetchClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      retries: 3,
      retryDelay: 1000,
      onError: () => {},
      onRequest: () => {},
      onResponse: () => {},
      ...config,
    };
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Redact sensitive headers for logging
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];
    sensitiveHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase();
      if (sanitized[lowerHeader]) {
        sanitized[lowerHeader] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private async makeRequest<T>(
    request: ApiRequest,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Build URL
    let url = request.url;
    if (request.params) {
      const searchParams = new URLSearchParams();
      Object.entries(request.params).forEach(([key, value]: [string, string | number | boolean]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    if (this.config.baseURL && !url.startsWith('http')) {
      url = `${this.config.baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Prepare headers
    const headers = {
      ...this.config.defaultHeaders,
      ...request.headers,
    };

    // Prepare request object
    const fetchRequest: RequestInit = {
      method: request.method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (request.body && request.method !== 'GET') {
      fetchRequest.body = typeof request.body === 'string' 
        ? request.body 
        : JSON.stringify(request.body);
    }

    // Log request (with sanitized headers)
    this.config.onRequest({
      ...request,
      url,
      headers: this.sanitizeHeaders(headers),
    });

    try {
      const response = await fetch(url, fetchRequest);
      
      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        requestId,
      };

      this.config.onResponse(apiResponse);

      if (!response.ok) {
        const error = new ApiError({
          error: response.statusText,
          message: typeof data === 'object' && data && 'message' in data 
            ? String((data as any).message) 
            : response.statusText,
          status: response.status,
          requestId,
          details: data,
        });
        throw error;
      }

      return apiResponse;
    } catch (error) {
      let apiError: ApiError;
      
      if (error instanceof ApiError) {
        apiError = error;
      } else {
        apiError = new ApiError({
          error: error instanceof Error ? error.name : 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 0,
          requestId,
        });
      }

      // Retry logic
      if (attempt < this.config.retries && this.shouldRetry(error)) {
        await this.delay(this.config.retryDelay * attempt);
        return this.makeRequest<T>(request, attempt + 1);
      }

      this.config.onError(apiError);
      throw apiError;
    }
  }

  private shouldRetry(error: any): boolean {
    // Don't retry on client errors (4xx) except for 408, 429
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }
    
    // Retry on network errors and server errors (5xx)
    return !(error instanceof ApiError);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method helpers
  async get<T>(url: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'GET',
      url,
      ...options,
    });
  }

  async post<T>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'POST',
      url,
      body,
      ...options,
    });
  }

  async put<T>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PUT',
      url,
      body,
      ...options,
    });
  }

  async delete<T>(url: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  async patch<T>(url: string, body?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({
      method: 'PATCH',
      url,
      body,
      ...options,
    });
  }

  // Configuration updates
  setAuthToken(token: string): void {
    this.config.defaultHeaders = {
      ...this.config.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    };
  }

  removeAuthToken(): void {
    const { Authorization, ...headers } = this.config.defaultHeaders;
    this.config.defaultHeaders = headers;
  }

  updateConfig(updates: Partial<FetchClientConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Default instance
export const fetchClient = new FetchClient();
