"use client"

import { useEffect, useState, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, CheckCircle, AlertTriangle, Plus, Loader2 } from "lucide-react"
import { analyticsService, websiteService, alertService } from "@/lib/api"
import { DashboardSummary, Website, Alert, PerformanceData, WebsiteStatus } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useWebSocket } from "@/lib/hooks/use-websocket"

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [websites, setWebsites] = useState<Website[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // WebSocket callbacks with useCallback to prevent re-renders
  const handleWebsiteStatus = useCallback((data: any) => {
    // Update website status in real-time
    setWebsites((prev) =>
      prev.map((w) => (w.id === data.website_id ? { ...w, status: data.status } : w))
    )
  }, [])

  const handleAlertTriggered = useCallback((data: any) => {
    // Add new alert to the list
    setAlerts((prev) => [data.alert, ...prev].slice(0, 4)) // Keep only 4 latest
  }, [])

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    onWebsiteStatus: handleWebsiteStatus,
    onAlertTriggered: handleAlertTriggered,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      // Load all data in parallel
      const [summaryData, websitesData, alertsData] = await Promise.all([
        analyticsService.getSummary(),
        websiteService.getAll(),
        alertService.getAll({ page: 1, page_size: 4 }),
      ])

      setSummary(summaryData)
      setWebsites(websitesData?.items?.slice(0, 5) || []) // Show only 5 websites
      setAlerts(alertsData?.items || [])
      
      // Load performance data if we have websites
      if (websitesData?.items && websitesData.items.length > 0) {
        try {
          const performanceResult = await analyticsService.getPerformance({
            website_id: websitesData.items[0].id,
            interval: 'hour',
          })
          
          // Transform performance data for chart
          if (performanceResult && performanceResult.length > 0) {
            const chartData = performanceResult.map((point: PerformanceData) => ({
              time: new Date(point.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              latency: point.average_response_time,
            }))
            setPerformanceData(chartData)
          }
        } catch (perfError) {
          console.error("Failed to load performance data:", perfError)
          // Don't fail entire dashboard if performance fails
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Main Dashboard</h1>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`}
            ></div>
            <span className={isConnected ? "text-green-500" : "text-gray-500"}>
              {isConnected ? "System Operational" : "Connecting..."}
            </span>
          </div>
        </div>
        <Link href="/dashboard/websites">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL MONITORED"
          value={summary?.total_websites.toString() || "0"}
          icon="◈"
          trend={`${summary?.websites_up || 0} up`}
          color="from-blue-600 to-blue-700"
        />
        <StatCard
          title="WEBSITES UP"
          value={summary?.websites_up.toString() || "0"}
          icon="✓"
          trend="Operational"
          color="from-green-600 to-green-700"
        />
        <StatCard
          title="WEBSITES DOWN"
          value={summary?.websites_down.toString() || "0"}
          icon="⚠"
          trend={summary && summary.websites_down > 0 ? "ACT NOW" : "All Good"}
          color="from-red-600 to-red-700"
        />
        <StatCard
          title="AVG LATENCY"
          value={`${summary?.average_response_time?.toFixed(0) || 0} ms`}
          icon="◐"
          trend={summary && summary.average_response_time > 500 ? "High" : "Normal"}
          color="from-amber-600 to-amber-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Response Time Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Global Response Time</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`}></div>
                <span className={`text-sm font-semibold ${isConnected ? "text-green-500" : "text-gray-500"}`}>
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {summary?.average_response_time?.toFixed(0) || 0}ms
              </div>
              <span
                className={`text-sm ${
                  summary && summary.average_response_time < 500 ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {summary && summary.average_response_time < 500 ? "Normal" : "High"}
              </span>
            </div>
          </div>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b6aff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5b6aff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#5b6aff"
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No performance data available
            </div>
          )}
        </div>

        {/* Critical Alerts */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">RECENT ALERTS</h2>
            <Link href="/dashboard/alerts" className="text-primary text-sm font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => {
                const Icon =
                  alert.severity === "critical"
                    ? AlertCircle
                    : alert.severity === "warning"
                      ? AlertTriangle
                      : CheckCircle
                const color =
                  alert.severity === "critical"
                    ? "text-red-500"
                    : alert.severity === "warning"
                      ? "text-yellow-500"
                      : "text-green-500"

                return (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                    <Icon className={`${color} flex-shrink-0 mt-0.5`} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* Monitored Endpoints Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Monitored Websites{" "}
            <span className="text-muted-foreground text-sm font-normal">
              {summary?.total_websites || 0} Total
            </span>
          </h2>
          <Link href="/dashboard/websites">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">NAME</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">URL</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">UPTIME</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">LATENCY</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {websites.length > 0 ? (
                websites.map((website) => (
                  <tr
                    key={website.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">◆</span>
                        <span className="font-semibold">{website.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{website.url}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          website.status === WebsiteStatus.UP
                            ? "bg-green-900/30 text-green-400"
                            : website.status === WebsiteStatus.DOWN
                              ? "bg-red-900/30 text-red-400"
                              : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {website.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {website.uptime_percentage ? `${website.uptime_percentage.toFixed(2)}%` : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      {website.last_response_time ? `${website.last_response_time}ms` : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/dashboard/monitor/${website.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No websites being monitored.{" "}
                    <Link href="/dashboard/websites" className="text-primary hover:underline">
                      Add your first website
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string
  value: string
  icon: string
  trend: string
  color: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 group hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span
          className={`text-sm font-semibold ${
            trend === "ACT NOW"
              ? "text-destructive"
              : trend === "All Good" || trend.includes("%")
                ? "text-green-500"
                : "text-muted-foreground"
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="w-full h-1 bg-secondary rounded-full mt-4 overflow-hidden">
        <div className={`h-full w-3/4 bg-gradient-to-r ${color}`}></div>
      </div>
    </div>
  )
}
