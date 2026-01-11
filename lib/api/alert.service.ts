/**
 * Alert API Service
 * Handles alert-related API calls
 */

import { apiClient } from './client';
import {
  Alert,
  AlertQueryParams,
  UpdateAlertRequest,
  PaginatedResponse,
} from '@/lib/types/api';

export const alertService = {
  /**
   * Get all alerts with optional filters
   */
  async getAll(params?: AlertQueryParams): Promise<PaginatedResponse<Alert>> {
    const data = await apiClient.get<any>('/alerts', params);
    // Backend returns PaginatedAlerts with 'data' and 'limit' fields
    // Map to frontend format with 'items' and 'page_size'
    return {
      items: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.limit || 20,
      total_pages: data.total_pages || 1,
    };
  },

  /**
   * Get alert by ID
   */
  async getById(id: string): Promise<Alert> {
    return await apiClient.get<Alert>(`/alerts/${id}`);
  },

  /**
   * Update alert (mark as read, resolve, etc.)
   */
  async update(id: string, data: UpdateAlertRequest): Promise<Alert> {
    return await apiClient.put<Alert>(`/alerts/${id}`, data);
  },

  /**
   * Mark alert as read using dedicated endpoint
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.put<void>(`/alerts/${id}/read`, {});
  },

  /**
   * Mark alert as resolved using dedicated endpoint
   */
  async resolve(id: string): Promise<void> {
    await apiClient.put<void>(`/alerts/${id}/resolve`, {});
  },

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(): Promise<void> {
    const alerts = await this.getAll({ is_read: false });
    await Promise.all(
      alerts.items.map(alert => this.markAsRead(alert.id))
    );
  },

  /**
   * Get unread alert count
   */
  async getUnreadCount(): Promise<number> {
    const result = await this.getAll({ is_read: false, page: 1, page_size: 1 });
    return result.total;
  },
};
