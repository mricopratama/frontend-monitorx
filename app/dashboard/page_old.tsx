"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const latencyData = [
    { time: "12:00", latency: 250 },
    { time: "12:10", latency: 280 },
    { time: "12:20", latency: 320 },
    { time: "12:30", latency: 380 },
    { time: "12:40", latency: 420 },
    { time: "12:50", latency: 450 },
    { time: "NOW", latency: 500 },
  ]

  const alertsData = [
    { id: 1, icon: AlertCircle, title: "API Gateway 502", time: "2m ago", color: "text-destructive" },
    { id: 2, icon: AlertTriangle, title: "Latency Spike", time: "15m ago", color: "text-yellow-500" },
    { id: 3, icon: CheckCircle, title: "DB Sync Complete", time: "1h ago", color: "text-green-500" },
    { id: 4, icon: AlertCircle, title: "CDN Outage EU", time: "3h ago", color: "text-destructive" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Main Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-green-500 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          System Operational
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL MONITORED" value="54" icon="◈" trend="+2.5%" color="from-blue-600 to-blue-700" />
        <StatCard title="WEBSITES UP" value="52" icon="✓" trend="96.3%" color="from-green-600 to-green-700" />
        <StatCard title="WEBSITES DOWN" value="2" icon="⚠" trend="ACT NOW" color="from-red-600 to-red-700" />
        <StatCard title="AVG LATENCY" value="340 ms" icon="◐" trend="+12ms" color="from-amber-600 to-amber-700" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Response Time Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Global Response Time</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-500 font-semibold">LIVE</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">50ms</div>
              <span className="text-sm text-green-500">Normal</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6aff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#5b6aff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Area type="monotone" dataKey="latency" stroke="#5b6aff" fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-muted-foreground mt-4">
            <span>FROM: 11/20/2023, 12:0 - TO: 11/20/2023, 02:0</span>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80">1H</button>
              <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80">24H</button>
              <button className="px-3 py-1 bg-secondary rounded hover:bg-secondary/80">7D</button>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">CRITICAL ALERTS</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View Logs</button>
          </div>
          <div className="space-y-3">
            {alertsData.map((alert) => {
              const Icon = alert.icon
              return (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <Icon className={`${alert.color} flex-shrink-0 mt-0.5`} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Monitored Endpoints Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Monitored Endpoints <span className="text-muted-foreground text-sm font-normal">54 Total</span>
          </h2>
          <select className="bg-secondary border border-border rounded px-3 py-1 text-sm">
            <option>Status: All</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">SERVICE NAME</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">ENDPOINT URL</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">CURRENT STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">UPTIME (24H)</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">LATENCY</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">OPTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "App Backend",
                  url: "api.monitorpro.com",
                  status: "OPERATIONAL",
                  uptime: "99.99%",
                  latency: "45ms",
                  icon: "◆",
                },
                {
                  name: "Landing Page",
                  url: "monitorpro.com",
                  status: "OFFLINE",
                  uptime: "95.60%",
                  latency: "TIMEOUT",
                  icon: "▲",
                },
                {
                  name: "Customer Portal",
                  url: "portal.monitorpro.com",
                  status: "DEGRADED",
                  uptime: "98.20%",
                  latency: "1200ms",
                  icon: "◆",
                },
              ].map((endpoint, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{endpoint.icon}</span>
                      <span className="font-semibold">{endpoint.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{endpoint.url}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        endpoint.status === "OPERATIONAL"
                          ? "bg-green-900/30 text-green-400"
                          : endpoint.status === "OFFLINE"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {endpoint.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{endpoint.uptime}</td>
                  <td className="py-4 px-4">{endpoint.latency}</td>
                  <td className="py-4 px-4">
                    <button className="text-muted-foreground hover:text-foreground">...</button>
                  </td>
                </tr>
              ))}
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
          className={`text-sm font-semibold ${trend.startsWith("+") || trend === "ACT NOW" ? (trend === "ACT NOW" ? "text-destructive" : "text-green-500") : "text-muted-foreground"}`}
        >
          {trend}
        </span>
      </div>
      <div className="w-full h-1 bg-secondary rounded-full mt-4 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color}`}></div>
      </div>
    </div>
  )
}
