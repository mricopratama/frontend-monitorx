/**
 * Website API Service
 * Handles all website monitoring-related API calls
 */

import { apiClient } from './client';
import {
  Website,
  CreateWebsiteRequest,
  UpdateWebsiteRequest,
  PaginatedResponse,
  PaginationParams,
  MonitoringLog,
} from '@/lib/types/api';

export const websiteService = {
  /**
   * Get all websites for current user
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Website>> {
    const data = await apiClient.get<Website[]>('/websites', params);
    // Backend returns array directly, wrap it in PaginatedResponse format
    return {
      items: Array.isArray(data) ? data : [],
      total: Array.isArray(data) ? data.length : 0,
      page: params?.page || 1,
      page_size: params?.page_size || (Array.isArray(data) ? data.length : 0),
      total_pages: 1,
    };
  },

  /**
   * Get website by ID
   */
  async getById(id: string | number): Promise<Website> {
    return await apiClient.get<Website>(`/websites/${id}`);
  },

  /**
   * Create new website
   */
  async create(data: CreateWebsiteRequest): Promise<Website> {
    return await apiClient.post<Website>('/websites', data);
  },

  /**
   * Update website
   */
  async update(id: string | number, data: UpdateWebsiteRequest): Promise<Website> {
    return await apiClient.put<Website>(`/websites/${id}`, data);
  },

  /**
   * Delete website
   */
  async delete(id: string | number): Promise<void> {
    return await apiClient.delete<void>(`/websites/${id}`);
  },

  /**
   * Get monitoring logs for a specific website
   */
  async getLogs(id: string | number, params?: { limit?: number }): Promise<MonitoringLog[]> {
    return await apiClient.get<MonitoringLog[]>(`/websites/${id}/logs`, params);
  },
};
