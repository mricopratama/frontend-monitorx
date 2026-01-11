/**
 * Analytics API Service
 * Handles dashboard analytics and statistics
 */

import { apiClient } from './client';
import {
  DashboardSummary,
  UptimeData,
  PerformanceData,
} from '@/lib/types/api';

export const analyticsService = {
  /**
   * Get dashboard summary statistics
   */
  async getSummary(): Promise<DashboardSummary> {
    return await apiClient.get<DashboardSummary>('/dashboard/summary');
  },

  /**
   * Get uptime data for all websites
   */
  async getUptime(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<UptimeData[]> {
    return await apiClient.get<UptimeData[]>('/analytics/uptime', params);
  },

  /**
   * Get performance data for a specific website
   */
  async getPerformance(params: {
    website_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PerformanceData[]> {
    return await apiClient.get<PerformanceData[]>('/analytics/performance', params);
  },
};
