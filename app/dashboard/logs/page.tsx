"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { monitoringService, websiteService } from "@/lib/api"
import { MonitoringLog, Website } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LogsPage() {
  const [logs, setLogs] = useState<MonitoringLog[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "up" | "down">("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  useEffect(() => {
    loadWebsites()
  }, [])

  useEffect(() => {
    loadLogs()
  }, [page, selectedWebsite, statusFilter, pageSize])

  const loadWebsites = async () => {
    try {
      const data = await websiteService.getAll()
      setWebsites(data?.items || [])
    } catch (err) {
      console.error("Failed to load websites:", err)
    }
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params: any = { page, page_size: pageSize }
      
      if (selectedWebsite !== "all") {
        params.website_id = selectedWebsite
      }

      const data = await monitoringService.getLogs(params)
      setLogs(data.items || [])
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      console.error("Failed to load logs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page when changing page size
  }

  const filteredLogs = logs.filter((log) => {
    if (statusFilter === "all") return true
    return statusFilter === "up" ? log.is_up : !log.is_up
  })

  const stats = {
    total: logs.length,
    successful: logs.filter((l) => l.is_up).length,
    failed: logs.filter((l) => !l.is_up).length,
    avgResponse: logs.length > 0 
      ? Math.round(logs.reduce((acc, l) => acc + l.response_time, 0) / logs.length)
      : 0,
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
        <h1 className="text-3xl font-bold">Monitoring Logs</h1>
        <p className="text-muted-foreground mt-1">Detailed history of all monitoring checks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Total Checks</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Successful</p>
          <p className="text-3xl font-bold text-green-500">{stats.successful}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Failed</p>
          <p className="text-3xl font-bold text-red-500">{stats.failed}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Avg Response</p>
          <p className="text-3xl font-bold">{stats.avgResponse}ms</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={selectedWebsite}
              onChange={(e) => { setSelectedWebsite(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
            >
              <option value="all">All Websites</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "up", label: "Success" },
              { key: "down", label: "Failed" },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.key as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">WEBSITE</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">STATUS CODE</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">RESPONSE TIME</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">CHECKED AT</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">ERROR</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4">
                      {log.is_up ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {websites.find((w) => w.id === log.website_id)?.name || log.website_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.status_code >= 200 && log.status_code < 300
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-3 px-4">{log.response_time}ms</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(log.checked_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {log.error_message || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-card border rounded-lg">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <div className="flex gap-1">
                {[20, 50, 100].map((size) => (
                  <Button
                    key={size}
                    variant={pageSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageSizeChange(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(1)}
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Total Count */}
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, stats.total)} of {stats.total}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
