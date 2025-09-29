// Base API types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  requestId?: string;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
  requestId?: string;
  details?: any;
}

export class ApiError extends Error {
  public error: string;
  public status: number;
  public requestId?: string;
  public details?: any;

  constructor({ error, message, status, requestId, details }: {
    error: string;
    message: string;
    status: number;
    requestId?: string;
    details?: any;
  }) {
    super(message);
    this.name = 'ApiError';
    this.error = error;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

// Telemetry types
export interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  debug?: boolean;
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Theme override types
export interface ThemeOverrides {
  colors?: Partial<Record<string, string>>;
  spacing?: Partial<Record<string, string>>;
  typography?: Partial<Record<string, any>>;
}

// Widget props base
export interface BaseWidgetProps {
  apiBase: string;
  authToken?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  themeOverrides?: ThemeOverrides;
}
