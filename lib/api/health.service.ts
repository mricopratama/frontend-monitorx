/**
 * Health Check API Service
 * Handles API health check calls
 */

import { apiClient } from './client';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export const healthService = {
  /**
   * Check API health status
   */
  async check(): Promise<HealthResponse> {
    return await apiClient.get<HealthResponse>('/health');
  },

  /**
   * Check if API is available
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.check();
      return response.status === 'healthy';
    } catch {
      return false;
    }
  },
};
