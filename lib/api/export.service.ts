import { apiClient } from './client';

export interface ExportLogsParams {
  websiteId?: string;
  limit?: number;
}

export interface ExportAnalyticsParams {
  type: 'uptime' | 'performance';
  websiteId?: string;
  startDate?: string;
  endDate?: string;
}

export const exportService = {
  /**
   * Export monitoring logs to CSV
   */
  async exportLogs(params?: ExportLogsParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.websiteId) queryParams.append('website_id', params.websiteId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/export/logs?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export analytics data to CSV
   */
  async exportAnalytics(params: ExportAnalyticsParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', params.type);
    if (params.websiteId) queryParams.append('website_id', params.websiteId);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);

    const response = await apiClient.get(`/export/analytics?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
