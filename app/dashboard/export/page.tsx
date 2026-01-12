'use client';

import { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { exportService } from '@/lib/api';

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      const blob = await exportService.exportLogs({ limit: 5000 });
      const timestamp = new Date().toISOString().split('T')[0];
      exportService.downloadBlob(blob, `monitoring-logs-${timestamp}.csv`);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportUptimeAnalytics = async () => {
    try {
      setIsExporting(true);
      const blob = await exportService.exportAnalytics({
        type: 'uptime',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const timestamp = new Date().toISOString().split('T')[0];
      exportService.downloadBlob(blob, `analytics-uptime-${timestamp}.csv`);
    } catch (error) {
      console.error('Failed to export analytics:', error);
      alert('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPerformanceAnalytics = async () => {
    try {
      setIsExporting(true);
      const blob = await exportService.exportAnalytics({
        type: 'performance',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const timestamp = new Date().toISOString().split('T')[0];
      exportService.downloadBlob(blob, `analytics-performance-${timestamp}.csv`);
    } catch (error) {
      console.error('Failed to export analytics:', error);
      alert('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground mt-2">
          Export monitoring logs and analytics data to CSV format
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range (Optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Export Monitoring Logs */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Monitoring Logs
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Export detailed monitoring check results including timestamps, status, response times, and error messages.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Includes all website monitoring checks</li>
              <li>• Response times and status codes</li>
              <li>• Error messages and timestamps</li>
              <li>• Limited to last 5,000 records</li>
            </ul>
          </div>
          <Button
            onClick={handleExportLogs}
            disabled={isExporting}
            className="ml-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </Card>

      {/* Export Uptime Analytics */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uptime Analytics
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Export uptime statistics including uptime percentages, total checks, and success/failure counts.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Daily uptime percentages per website</li>
              <li>• Total checks and success rates</li>
              <li>• Failed check counts</li>
              <li>• Filtered by date range if specified</li>
            </ul>
          </div>
          <Button
            onClick={handleExportUptimeAnalytics}
            disabled={isExporting}
            className="ml-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Uptime
          </Button>
        </div>
      </Card>

      {/* Export Performance Analytics */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Performance Analytics
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Export performance metrics including average, minimum, and maximum response times.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Average response times per day</li>
              <li>• Min/max response time ranges</li>
              <li>• Total request counts</li>
              <li>• Filtered by date range if specified</li>
            </ul>
          </div>
          <Button
            onClick={handleExportPerformanceAnalytics}
            disabled={isExporting}
            className="ml-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Performance
          </Button>
        </div>
      </Card>
    </div>
  );
}
