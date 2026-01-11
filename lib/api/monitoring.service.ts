/**
 * Monitoring API Service
 * Handles monitoring logs and results
 */

import { apiClient } from './client';
import {
  MonitoringLog,
  MonitoringLogParams,
  PaginatedResponse,
} from '@/lib/types/api';

export const monitoringService = {
  /**
   * Get monitoring logs for a website
   */
  async getLogs(params: MonitoringLogParams): Promise<PaginatedResponse<MonitoringLog>> {
    const data = await apiClient.get<any>(`/logs`, params);
    // Backend returns PaginatedResults with 'data' and 'limit' fields
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
   * Get latest monitoring result for a website
   */
  async getLatest(websiteId: string): Promise<MonitoringLog | null> {
    const result = await this.getLogs({ website_id: websiteId, page: 1, page_size: 1 });
    return result.items[0] || null;
  },
};
