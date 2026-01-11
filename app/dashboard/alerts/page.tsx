"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { alertService } from "@/lib/api"
import { Alert, AlertSeverity } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "resolved" | "unresolved" | AlertSeverity>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadAlerts()
  }, [page, filter])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError("")
      const params: any = { page, page_size: 20 }
      
      if (filter !== "all") {
        if (Object.values(AlertSeverity).includes(filter as AlertSeverity)) {
          params.severity = filter
        } else if (filter === "unread") {
          params.is_read = false
        } else if (filter === "resolved") {
          params.is_resolved = true
        } else if (filter === "unresolved") {
          params.is_resolved = false
        }
      }

      const data = await alertService.getAll(params)
      setAlerts(data.items)
      setTotalPages(data.total_pages)
    } catch (err: any) {
      console.error("Failed to load alerts:", err)
      setError("Failed to load alerts")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertService.markAsRead(id)
      await loadAlerts()
    } catch (err) {
      console.error("Failed to mark alert as read:", err)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await alertService.resolve(id)
      await loadAlerts()
    } catch (err) {
      console.error("Failed to resolve alert:", err)
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.HIGH:
        return <XCircle className="w-5 h-5 text-red-500" />
      case AlertSeverity.MEDIUM:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case AlertSeverity.LOW:
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.HIGH:
        return "bg-red-900/30 text-red-400"
      case AlertSeverity.MEDIUM:
        return "bg-yellow-900/30 text-yellow-400"
      case AlertSeverity.LOW:
        return "bg-blue-900/30 text-blue-400"
      default:
        return "bg-gray-900/30 text-gray-400"
    }
  }

  const stats = {
    total: alerts?.length || 0,
    high: alerts?.filter((a) => a.severity === AlertSeverity.HIGH).length || 0,
    unread: alerts?.filter((a) => !a.is_read).length || 0,
    unresolved: alerts?.filter((a) => !a.is_resolved).length || 0,
  }

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">Track system health incidents and manage resolution workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Total Alerts</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">High Severity</p>
          <p className="text-3xl font-bold text-red-500">{stats.high}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Unread</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.unread}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Unresolved</p>
          <p className="text-3xl font-bold">{stats.unresolved}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={loadAlerts} className="ml-auto">Retry</Button>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        <div className="flex gap-2 mb-4">
          {["all", "unread", "unresolved", "resolved", AlertSeverity.HIGH, AlertSeverity.MEDIUM, AlertSeverity.LOW].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter(f as any); setPage(1); }}
            >
              {f.toString().toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {(alerts?.length || 0) > 0 ? (
            alerts?.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${!alert.is_read ? "bg-secondary/50" : "bg-card"} hover:bg-secondary transition-colors`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.website_name && (
                        <span className="text-sm font-semibold">{alert.website_name}</span>
                      )}
                      {!alert.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!alert.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(alert.id)}>
                        Mark Read
                      </Button>
                    )}
                    {!alert.is_resolved && (
                      <Button variant="ghost" size="sm" onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No alerts found</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
