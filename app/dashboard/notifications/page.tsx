'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Mail, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { settingsService, type UserSettings, type UpdateUserSettingsRequest } from '@/lib/api';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateUserSettingsRequest>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        email_on_downtime: data.email_on_downtime,
        email_on_recovery: data.email_on_recovery,
        email_on_ssl_expiry: data.email_on_ssl_expiry,
        email_daily_summary: data.email_daily_summary,
        email_weekly_report: data.email_weekly_report,
        downtime_alert_after_checks: data.downtime_alert_after_checks,
        response_time_threshold: data.response_time_threshold,
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
        quiet_hours_timezone: data.quiet_hours_timezone,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await settingsService.updateSettings(formData);
      setSettings(updated);
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how and when you receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.email_on_downtime ?? true}
              onChange={(e) =>
                setFormData({ ...formData, email_on_downtime: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Downtime Alerts</div>
              <div className="text-sm text-muted-foreground">
                Get notified when a website goes down
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.email_on_recovery ?? true}
              onChange={(e) =>
                setFormData({ ...formData, email_on_recovery: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Recovery Notifications</div>
              <div className="text-sm text-muted-foreground">
                Get notified when a website recovers
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.email_on_ssl_expiry ?? true}
              onChange={(e) =>
                setFormData({ ...formData, email_on_ssl_expiry: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">SSL Expiry Warnings</div>
              <div className="text-sm text-muted-foreground">
                Get notified about SSL certificate expiration
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.email_daily_summary ?? false}
              onChange={(e) =>
                setFormData({ ...formData, email_daily_summary: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Daily Summary</div>
              <div className="text-sm text-muted-foreground">
                Receive a daily summary of all monitoring activity
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.email_weekly_report ?? false}
              onChange={(e) =>
                setFormData({ ...formData, email_weekly_report: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Weekly Report</div>
              <div className="text-sm text-muted-foreground">
                Receive a weekly performance and uptime report
              </div>
            </div>
          </label>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Alert Thresholds
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Consecutive Failures Before Alert
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.downtime_alert_after_checks ?? 2}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  downtime_alert_after_checks: parseInt(e.target.value) || 2,
                })
              }
            />
            <p className="text-sm text-muted-foreground mt-1">
              Alert after this many consecutive failed checks (1-10)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Response Time Threshold (ms)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="Leave empty to disable"
              value={formData.response_time_threshold ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response_time_threshold: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
            />
            <p className="text-sm text-muted-foreground mt-1">
              Alert if response time exceeds this threshold (optional)
            </p>
          </div>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Quiet Hours
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Suppress non-critical notifications during these hours
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Time</label>
              <Input
                type="time"
                value={formData.quiet_hours_start ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quiet_hours_start: e.target.value || null,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Time</label>
              <Input
                type="time"
                value={formData.quiet_hours_end ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quiet_hours_end: e.target.value || null,
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Timezone</label>
            <Input
              value={formData.quiet_hours_timezone ?? 'UTC'}
              onChange={(e) =>
                setFormData({ ...formData, quiet_hours_timezone: e.target.value })
              }
              placeholder="UTC"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Shield className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
