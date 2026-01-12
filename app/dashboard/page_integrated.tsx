/**
 * Dashboard Page
 * Main dashboard with real-time monitoring data
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { analyticsService, websiteService, alertService } from '@/lib/api';
import { useWebSocket } from '@/lib/hooks';
import { Alert, AlertSeverity } from '@/lib/types/api';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DashboardSummary,
  Website,
  Alert as ApiAlert,
  MonitoringUpdateData,
} from '@/lib/types/api';
import { Activity, Globe, AlertTriangle, Clock, TrendingUp, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<ApiAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    onMonitoringUpdate: (data: MonitoringUpdateData) => {
      // Update website status in real-time
      setWebsites(prev =>
        prev.map(site =>
          site.id === data.website_id
            ? {
                ...site,
                status: data.status,
                last_response_time: data.response_time,
                last_status_code: data.status_code,
                last_checked_at: data.checked_at,
              }
            : site
        )
      );
    },
    onAlertTriggered: (data) => {
      // Add new alert to the list
      setRecentAlerts(prev => [data.alert, ...prev].slice(0, 5));
      // Refresh summary to update alert count
      loadSummary();
    },
  });

  const loadSummary = async () => {
    try {
      const data = await analyticsService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const loadWebsites = async () => {
    try {
      const data = await websiteService.getAll({ page: 1, page_size: 10 });
      setWebsites(data.items);
    } catch (error) {
      console.error('Failed to load websites:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertService.getAll({ page: 1, page_size: 5 });
      setRecentAlerts(data.items);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadSummary(), loadWebsites(), loadAlerts()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name || 'User'}
              {isConnected && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  <span className="text-sm text-green-600">Live</span>
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/websites">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
                <Globe className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_websites}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Websites Up</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summary.websites_up}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.websites_down} down
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.average_response_time.toFixed(0)}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summary.total_alerts}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.unread_alerts} unread
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Websites List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monitored Websites</CardTitle>
                <CardDescription>Your active website monitors</CardDescription>
              </div>
              <Link href="/dashboard/websites">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {websites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No websites monitored yet</p>
                <Link href="/dashboard/websites">
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Website
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {websites.map((website) => (
                  <Link
                    key={website.id}
                    href={`/dashboard/monitor/${website.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            website.status === 'up'
                              ? 'bg-green-500'
                              : website.status === 'down'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <div>
                          <h3 className="font-medium">{website.name}</h3>
                          <p className="text-sm text-gray-500">{website.url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {website.last_response_time
                            ? `${website.last_response_time}ms`
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {website.uptime_percentage
                            ? `${website.uptime_percentage.toFixed(1)}% uptime`
                            : 'No data'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest monitoring alerts</CardDescription>
              </div>
              <Link href="/dashboard/alerts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        alert.severity === AlertSeverity.CRITICAL || alert.severity === AlertSeverity.HIGH
                          ? 'text-red-600'
                          : alert.severity === AlertSeverity.MEDIUM
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.triggered_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        !alert.is_resolved
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {alert.is_resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
