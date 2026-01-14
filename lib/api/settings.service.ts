import { apiClient } from './client';

export interface UserSettings {
  user_id: string;
  email_on_downtime: boolean;
  email_on_recovery: boolean;
  email_on_ssl_expiry: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  downtime_alert_after_checks: number;
  response_time_threshold: number | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  quiet_hours_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsRequest {
  email_on_downtime?: boolean;
  email_on_recovery?: boolean;
  email_on_ssl_expiry?: boolean;
  email_daily_summary?: boolean;
  email_weekly_report?: boolean;
  downtime_alert_after_checks?: number;
  response_time_threshold?: number | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  quiet_hours_timezone?: string;
}

export const settingsService = {
  /**
   * Get user notification settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get('/auth/settings');
    return response.data;
  },

  /**
   * Update user notification settings
   */
  async updateSettings(data: UpdateUserSettingsRequest): Promise<UserSettings> {
    const response = await apiClient.put('/auth/settings', data);
    return response.data;
  },
};
