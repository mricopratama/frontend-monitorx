/**
 * Alert API Service
 * Handles alert-related API calls
 */

import { apiClient } from './client';
import {
  Alert,
  AlertQueryParams,
  AlertStatus,
  UpdateAlertRequest,
  PaginatedResponse,
} from '@/lib/types/api';

export const alertService = {
  /**
   * Get all alerts with optional filters
   */
  async getAll(params?: AlertQueryParams): Promise<PaginatedResponse<Alert>> {
    return await apiClient.get<PaginatedResponse<Alert>>('/alerts', params);
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
   * Mark alert as read
   */
  async markAsRead(id: string): Promise<Alert> {
    return this.update(id, { is_read: true });
  },

  /**
   * Mark alert as resolved
   */
  async resolve(id: string): Promise<Alert> {
    return this.update(id, { status: AlertStatus.RESOLVED });
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
