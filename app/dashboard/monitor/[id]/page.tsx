"use client"

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { websiteService, apiClient } from "@/lib/api"
import { Website, MonitoringLog, WebsiteStatus } from "@/lib/types/api"
import { config } from "@/lib/config"

export default function MonitorPage() {
  const params = useParams()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("24h")
  const [website, setWebsite] = useState<Website | null>(null)
  const [logs, setLogs] = useState<MonitoringLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const id = Array.isArray(params.id) ? params.id[0] : params.id
      
      // Validate ID format (should be UUID or valid integer)
      if (!id || id === 'undefined' || id === 'null') {
        setError("Invalid website ID")
        setTimeout(() => router.push("/dashboard/websites"), 2000)
        return
      }

      // Try to parse as integer first for backward compatibility
      const websiteId = !isNaN(Number(id)) ? parseInt(id as string, 10) : id

      // Load website data first
      const websiteData = await websiteService.getById(websiteId)
      setWebsite(websiteData)

      // Try to load logs using the website-specific endpoint
      try {
        // Use the /websites/{id}/logs endpoint which properly handles UUID
        const response = await apiClient.get<MonitoringLog[]>(`/websites/${websiteId}/logs`, { 
          limit: 100 
        })
        setLogs(response || [])
      } catch (logsError: any) {
        // Logs endpoint might not support UUID, that's OK - just show empty logs
        // Silently handle this error as it's expected behavior
        setLogs([])
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Website not found"
      setError(errorMessage)
      // Redirect to websites page after 3 seconds
      setTimeout(() => router.push("/dashboard/websites"), 3000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading monitor data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold text-destructive">{error}</div>
          <div className="text-muted-foreground">Redirecting to websites page...</div>
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold text-muted-foreground">Website not found</div>
          <div className="text-muted-foreground">Redirecting to websites page...</div>
        </div>
      </div>
    )
  }

  // Generate chart data from logs
  const responseData = logs.length > 0 
    ? logs.slice(0, 24).reverse().map((log, index) => ({
        time: new Date(log.checked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        response: log.response_time
      }))
    : [{ time: 'No data', response: 0 }]

  // Generate uptime data from logs
  const uptimeData = logs.length > 0
    ? logs.slice(0, 24).reverse().map((log, index) => ({
        time: new Date(log.checked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        uptime: log.status_code >= 200 && log.status_code < 300 ? 100 : 0
      }))
    : [{ time: 'No data', uptime: 0 }]

  // Calculate stats from logs
  const last24hLogs = logs.filter(log => {
    const logTime = new Date(log.checked_at).getTime()
    const now = Date.now()
    return now - logTime <= 24 * 60 * 60 * 1000
  })

  const avgResponse = last24hLogs.length > 0 
    ? Math.round(last24hLogs.reduce((sum, log) => sum + log.response_time, 0) / last24hLogs.length)
    : 0

  const successCount = last24hLogs.filter(log => log.status_code >= 200 && log.status_code < 300).length
  const uptime = last24hLogs.length > 0 
    ? ((successCount / last24hLogs.length) * 100).toFixed(2)
    : "0.00"

  const hasLogs = logs.length > 0

  // Determine status from latest log if website.status is not set
  let determinedStatus = website.status
  
  // If no status from backend, check if we have last_check
  if (!determinedStatus) {
    if (logs.length > 0) {
      // Use latest log to determine status
      const latestLog = logs[0]
      if (latestLog.status_code >= 200 && latestLog.status_code < 300) {
        determinedStatus = WebsiteStatus.UP
      } else {
        determinedStatus = WebsiteStatus.DOWN
      }
    } else if (website.last_check && website.last_check !== "Never") {
      // If website has been checked but no logs visible, assume monitoring
      determinedStatus = WebsiteStatus.UNKNOWN
    }
  }

  const statusText = determinedStatus?.toUpperCase() || (website.last_check === "Never" ? "PENDING" : "UNKNOWN")
  const statusColor = determinedStatus === WebsiteStatus.UP ? "green" : determinedStatus === WebsiteStatus.DOWN ? "red" : "yellow"

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{website.name}</h1>
            <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
              determinedStatus === 'up' ? 'bg-green-900/30 text-green-400' :
              determinedStatus === 'down' ? 'bg-red-900/30 text-red-400' :
              'bg-yellow-900/30 text-yellow-400'
            }`}>
              {statusText}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="truncate">🔗 {website.url}</span>
            <span className="whitespace-nowrap">⏱ {website.check_interval}s</span>
            <span className="whitespace-nowrap">🌐 {website.region || "Global"}</span>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button className="px-3 sm:px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-secondary transition-colors whitespace-nowrap">
            ⏸ Pause
          </button>
          <button className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
            ✎ Edit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">CURRENT STATUS</p>
          <p className="text-3xl font-bold">{statusText}</p>
          <div className={`w-full h-1 bg-${statusColor}-500 rounded-full mt-3`}></div>
          <p className="text-xs text-muted-foreground mt-2">Last checked: {website.last_check ? new Date(website.last_check).toLocaleString() : "Never"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">AVG RESPONSE (24H)</p>
          <p className="text-3xl font-bold">{avgResponse}ms</p>
          <p className="text-xs text-muted-foreground mt-1">{last24hLogs.length} checks</p>
          <div className="w-full h-1 bg-blue-500 rounded-full mt-3"></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">UPTIME (24H)</p>
          <p className="text-3xl font-bold">{uptime}%</p>
          <p className="text-xs text-muted-foreground mt-1">{successCount} / {last24hLogs.length} successful</p>
          <div className="w-full h-1 bg-blue-500 rounded-full mt-3"></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">TOTAL CHECKS</p>
          <p className="text-3xl font-bold">{logs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
          <div className="w-full h-1 bg-yellow-500 rounded-full mt-3"></div>
        </div>
      </div>

      {/* Info message if no logs available */}
      {!hasLogs && (
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-3 md:p-4">
          <div className="flex gap-2 md:gap-3 items-start">
            <span className="text-blue-400 text-lg md:text-xl flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-xs md:text-sm font-semibold text-foreground mb-1">No monitoring logs available yet</p>
              <p className="text-xs text-muted-foreground">
                Logs will appear once monitoring starts. Check interval: {website.check_interval}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Response Time Chart */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground">Response Time</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Last 24 Hours performance</p>
            </div>
            <div className="flex gap-2">
              {["24h", "7d", "30d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 md:px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={responseData}>
              <defs>
                <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6aff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#5b6aff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Area type="monotone" dataKey="response" stroke="#5b6aff" fillOpacity={1} fill="url(#colorResponse)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Uptime History Chart */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-base md:text-lg font-bold text-foreground">Uptime History</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Hourly availability status</p>
          </div>
          <ResponsiveContainer width="100%" height={200} className="md:h-[250px]">
            <BarChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="uptime" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
          {hasLogs && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/40 rounded-lg flex gap-2 items-start">
              <span className="text-yellow-500 flex-shrink-0">⚠</span>
              <div>
                <p className="text-xs md:text-sm font-semibold text-foreground">Monitoring Active</p>
                <p className="text-xs text-muted-foreground">Collecting performance data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base md:text-lg font-bold text-foreground">Recent Logs</h2>
          <button className="text-primary text-xs md:text-sm font-semibold hover:underline text-left sm:text-right">Download CSV</button>
        </div>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[640px]">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">TIMESTAMP</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">HTTP STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">RESPONSE TIME</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log) => {
                const isSuccess = log.status_code >= 200 && log.status_code < 300
                const isWarning = log.status_code >= 400 && log.status_code < 500
                const isError = log.status_code >= 500
                
                return (
                  <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-4 px-4">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                          isSuccess ? "bg-green-600" : isWarning ? "bg-yellow-600" : "bg-red-600"
                        }`}
                      >
                        {isSuccess ? "✓" : isWarning ? "!" : "✕"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(log.checked_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${isSuccess ? "text-green-400" : isWarning ? "text-yellow-400" : "text-red-400"}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-foreground font-semibold">{log.response_time}ms</td>
                    <td className="py-4 px-4 text-muted-foreground">{log.error_message || "-"}</td>
                  </tr>
                )
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        <button className="w-full py-2 mt-4 text-center text-xs md:text-sm text-muted-foreground hover:text-foreground border-t border-border transition-colors">
          Load more logs ▼
        </button>
      </div>
    </div>
  )
}
