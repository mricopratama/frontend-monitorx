/**
 * Analytics API Service
 * Handles dashboard analytics and statistics
 */

import { apiClient } from './client';
import {
  DashboardSummary,
  UptimeData,
  PerformanceData,
  WebsiteAnalytics,
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
    website_id: string;
    start_date?: string;
    end_date?: string;
    interval?: 'hour' | 'day' | 'week';
  }): Promise<PerformanceData[]> {
    return await apiClient.get<PerformanceData[]>('/analytics/performance', params);
  },

  /**
   * Get comprehensive analytics for a website
   */
  async getWebsiteAnalytics(websiteId: string): Promise<WebsiteAnalytics> {
    return await apiClient.get<WebsiteAnalytics>(`/analytics/websites/${websiteId}`);
  },

  /**
   * Get response time trends
   */
  async getResponseTimeTrends(params?: {
    period?: '24h' | '7d' | '30d';
  }): Promise<PerformanceData[]> {
    return await apiClient.get<PerformanceData[]>('/analytics/trends/response-time', params);
  },
};
