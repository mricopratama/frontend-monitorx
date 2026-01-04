/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/lib/types/api';
import { config } from '@/lib/config';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Store tokens and user
    if (response.access_token) {
      this.saveAuthData(response);
    }
    
    return response;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store tokens and user
    if (response.access_token) {
      this.saveAuthData(response);
    }
    
    return response;
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<User> {
    return await apiClient.get<User>('/auth/me');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.access_token) {
      this.saveAuthData(response);
    }
    
    return response;
  },

  /**
   * Logout user (client-side only, as backend doesn't have logout endpoint)
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
  },

  /**
   * Save authentication data to localStorage
   */
  saveAuthData(data: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(config.auth.tokenKey, data.access_token);
    
    if (data.refresh_token) {
      localStorage.setItem(config.auth.refreshTokenKey, data.refresh_token);
      apiClient.setRefreshToken(data.refresh_token);
    }
    
    if (data.user) {
      localStorage.setItem(config.auth.userKey, JSON.stringify(data.user));
    }
  },

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userJson = localStorage.getItem(config.auth.userKey);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem(config.auth.tokenKey);
    return !!token;
  },
};
