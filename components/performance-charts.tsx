"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState } from 'react'

interface ResponseTimeData {
  timestamp: string
  responseTime: number
  website: string
}

interface UptimeData {
  date: string
  uptime: number
  downtime: number
}

interface PerformanceChartsProps {
  websiteId?: string
  timeRange?: '24h' | '7d' | '30d'
}

export function PerformanceCharts({ websiteId, timeRange = '24h' }: PerformanceChartsProps) {
  const [responseData, setResponseData] = useState<ResponseTimeData[]>([])
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [websiteId, timeRange])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API calls
      // const response = await fetch(`/api/v1/analytics/performance?website_id=${websiteId}&range=${timeRange}`)
      // const data = await response.json()
      
      // Mock data for demonstration
      const mockResponseData: ResponseTimeData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        responseTime: Math.floor(Math.random() * 500) + 100,
        website: 'Example Site'
      }))

      const mockUptimeData: UptimeData[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uptime: Math.floor(Math.random() * 10) + 90,
        downtime: Math.floor(Math.random() * 10)
      }))

      setResponseData(mockResponseData)
      setUptimeData(mockUptimeData)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trends</CardTitle>
          <CardDescription>Average response time over {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={responseData}>
              <defs>
                <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="timestamp" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorResponseTime)" 
                name="Response Time (ms)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Uptime Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Uptime vs Downtime</CardTitle>
          <CardDescription>Percentage breakdown over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: '%', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="uptime" fill="#10b981" name="Uptime %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="downtime" fill="#ef4444" name="Downtime %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Performance Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Detailed response time metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="timestamp" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
