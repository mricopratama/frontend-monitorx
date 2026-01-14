"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PerformanceCharts } from "@/components/performance-charts"
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { analyticsService, websiteService } from "@/lib/api"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalChecks: 0,
    avgResponseTime: 0,
    avgUptime: 0,
    totalAlerts: 0
  })
  const [responseTimeData, setResponseTimeData] = useState<any[]>([])
  const [uptimeData, setUptimeData] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load dashboard summary
      const dashboardData = await analyticsService.getSummary()
      
      // Load websites for analytics
      const websitesData = await websiteService.getAll()
      const websites = websitesData.items || []
      
      // Calculate average uptime from websites
      const avgUptime = websites.length > 0
        ? websites.reduce((sum: number, w: any) => sum + (w.uptime_percentage || 0), 0) / websites.length
        : 0
      
      setStats({
        totalWebsites: dashboardData.total_websites || 0,
        totalChecks: websites.reduce((sum: number, w: any) => sum + (w.total_checks || 0), 0),
        avgResponseTime: dashboardData.average_response_time || 0,
        avgUptime: avgUptime,
        totalAlerts: dashboardData.total_alerts || 0
      })

      // Generate response time data (sample)
      const responseData = websites.slice(0, 10).map((website: any, index: number) => ({
        name: website.name.substring(0, 15),
        time: website.last_response_time || 0
      }))
      setResponseTimeData(responseData)

      // Generate uptime data
      const uptimeChartData = websites.slice(0, 5).map((website: any) => ({
        name: website.name.substring(0, 20),
        uptime: website.uptime_percentage || 0,
        downtime: 100 - (website.uptime_percentage || 0)
      }))
      setUptimeData(uptimeChartData)

    } catch (err: any) {
      console.error("Failed to load analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive monitoring statistics and insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24 Hours
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Websites</p>
              <p className="text-2xl font-bold">{stats.totalWebsites}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Checks</p>
              <p className="text-2xl font-bold">{stats.totalChecks.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Response</p>
              <p className="text-2xl font-bold">{stats.avgResponseTime.toFixed(0)}ms</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Uptime</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgUptime.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <PerformanceCharts timeRange={timeRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Time Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Response Time by Website</h2>
          {responseTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'currentColor' }}
                  className="text-xs"
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="time" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No data available</p>
          )}
        </Card>

        {/* Uptime Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Uptime by Website</h2>
          {uptimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'currentColor' }}
                  className="text-xs"
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="uptime" fill="#10b981" name="Uptime %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No data available</p>
          )}
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {((stats.totalWebsites > 0 ? (stats.totalWebsites - (stats.totalAlerts > 0 ? 1 : 0)) / stats.totalWebsites : 1) * 100).toFixed(1)}%
            </div>
            <p className="text-gray-600">Overall Health Score</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.avgResponseTime.toFixed(0)}ms
            </div>
            <p className="text-gray-600">Average Response Time</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.avgUptime.toFixed(2)}%
            </div>
            <p className="text-gray-600">System Uptime</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
