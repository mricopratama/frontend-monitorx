/**
 * API Client
 * Centralized HTTP client with authentication, error handling, and interceptors
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/lib/config';
import { ApiResponse } from '@/lib/types/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (config.method === 'get' && config.params) {
          // Clean undefined values from params
          Object.keys(config.params).forEach(
            key => config.params[key] === undefined && delete config.params[key]
          );
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue failed requests while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Attempt to refresh token
            const response = await this.client.post('/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data.data;
            this.setToken(access_token);

            // Process queued requests
            this.failedQueue.forEach((promise) => promise.resolve(access_token));
            this.failedQueue = [];

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear auth and redirect to login
            this.failedQueue.forEach((promise) => promise.reject(refreshError));
            this.failedQueue = [];
            this.clearAuth();
            
            // Redirect to login if in browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors and transform them into user-friendly messages
   */
  private handleError(error: AxiosError<ApiResponse> | AxiosError<unknown>): Error {
    if (config.app.debug) {
      console.error('API Error:', error);
    }

    // Network error
    if (!error.response) {
      return new Error('Network error. Please check your connection.');
    }

    // Server error with message
    const data = error.response.data as ApiResponse | undefined;
    if (data && typeof data === 'object' && 'message' in data && data.message) {
      return new Error(data.message);
    }

    // HTTP status based errors
    switch (error.response.status) {
      case 400:
        // Check if it's a specific validation error
        if (data && typeof data === 'object' && 'error' in data) {
          return new Error(String(data.error) || 'Invalid query parameters');
        }
        return new Error('Invalid request. Please check your input.');
      case 401:
        return new Error('Authentication required. Please log in.');
      case 403:
        return new Error('You do not have permission to perform this action.');
      case 404:
        return new Error('Resource not found.');
      case 409:
        return new Error('A conflict occurred. The resource may already exist.');
      case 422:
        return new Error('Validation failed. Please check your input.');
      case 429:
        return new Error('Too many requests. Please try again later.');
      case 500:
        return new Error('Server error. Please try again later.');
      case 503:
        return new Error('Service unavailable. Please try again later.');
      default:
        return new Error('An unexpected error occurred.');
    }
  }

  /**
   * Token management
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKey);
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.tokenKey, token);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  }

  public setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.refreshTokenKey, token);
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
  }

  /**
   * HTTP Methods
   */
  public async get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, {
      ...config,
      params,
    });
    return response.data.data as T;
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
    return response.data.data as T;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
    return response.data.data as T;
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
    return response.data.data as T;
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
    return response.data.data as T;
  }

  /**
   * Get raw axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
