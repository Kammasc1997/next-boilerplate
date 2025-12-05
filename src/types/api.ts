/**
 * Shared API response types
 */

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

