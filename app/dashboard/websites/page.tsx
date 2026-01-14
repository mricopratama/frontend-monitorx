"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Plus, Loader2, AlertCircle, Pencil, Trash2, ExternalLink, CheckCircle, XCircle, Filter, ArrowUpDown, Tag as TagIcon } from "lucide-react"
import { websiteService, tagService } from "@/lib/api"
import { Website, WebsiteStatus, CreateWebsiteRequest } from "@/lib/types/api"
import { Tag } from "@/lib/api/tag.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useWebSocket } from "@/lib/hooks/use-websocket"

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const [formData, setFormData] = useState<CreateWebsiteRequest>({
    name: "",
    url: "",
    monitoring_interval: 60,
    timeout_threshold: 5000,
  })
  const [submitting, setSubmitting] = useState(false)

  // WebSocket for real-time updates
  const handleWebsiteStatus = useCallback((data: any) => {
    setWebsites((prev) =>
      prev.map((w) => (w.id === data.website_id ? { ...w, status: data.status } : w))
    )
  }, [])

  const { isConnected } = useWebSocket({
    onWebsiteStatus: handleWebsiteStatus,
  })

  useEffect(() => {
    loadWebsites()
    loadTags()
  }, [searchQuery, statusFilter, selectedTagIds, sortBy, sortOrder])

  const loadTags = async () => {
    try {
      const data = await tagService.getAll()
      setTags(data?.items || [])
    } catch (err) {
      console.error("Failed to load tags:", err)
    }
  }

  const loadWebsites = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (selectedTagIds.length > 0) params.append('tags', selectedTagIds.join(','))
      if (sortBy) params.append('sort_by', sortBy)
      if (sortOrder) params.append('sort_order', sortOrder)
      
      const queryString = params.toString()
      const url = queryString ? `/websites?${queryString}` : '/websites'
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch websites')
      
      const result = await response.json()
      setWebsites(result.data || [])
    } catch (err: any) {
      console.error("Failed to load websites:", err)
      setError(err.response?.data?.message || "Failed to load websites")
    } finally {
      setLoading(false)
    }
  }

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      console.log("Creating website with data:", formData)
      const result = await websiteService.create(formData)
      console.log("Website created successfully:", result)
      setShowAddDialog(false)
      setFormData({
        name: "",
        url: "",
        monitoring_interval: 60,
        timeout_threshold: 5000,
      })
      await loadWebsites()
    } catch (err: any) {
      console.error("Failed to add website:", err)
      console.error("Error response:", err.response?.data)
      alert(err.response?.data?.message || err.message || "Failed to add website")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWebsite) return

    try {
      setSubmitting(true)
      await websiteService.update(selectedWebsite.id, formData)
      setShowEditDialog(false)
      setSelectedWebsite(null)
      await loadWebsites()
    } catch (err: any) {
      console.error("Failed to update website:", err)
      alert(err.response?.data?.message || "Failed to update website")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWebsite = async () => {
    if (!selectedWebsite) return

    try {
      setSubmitting(true)
      await websiteService.delete(selectedWebsite.id)
      setShowDeleteDialog(false)
      setSelectedWebsite(null)
      await loadWebsites()
    } catch (err: any) {
      console.error("Failed to delete website:", err)
      alert(err.response?.data?.message || "Failed to delete website")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (website: Website) => {
    setSelectedWebsite(website)
    setFormData({
      name: website.name,
      url: website.url,
      monitoring_interval: website.monitoring_interval,
      timeout_threshold: website.timeout_threshold,
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (website: Website) => {
    setSelectedWebsite(website)
    setShowDeleteDialog(true)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSelectedTagIds([])
    setSortBy("created_at")
    setSortOrder("desc")
  }

  const statsData = {
    total: websites.length,
    up: websites.filter((w) => w.status === WebsiteStatus.UP).length,
    down: websites.filter((w) => w.status === WebsiteStatus.DOWN).length,
    avgResponse:
      websites.length > 0
        ? Math.round(
            websites.reduce((acc, w) => acc + (w.last_response_time || 0), 0) / websites.length
          )
        : 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Website Management</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your monitored endpoints, real-time status checks, and performance metrics.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Website
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Total Monitored</p>
          <p className="text-3xl font-bold">{statsData.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Operational</p>
          <p className="text-3xl font-bold text-green-500">{statsData.up}</p>
          <p className="text-xs text-green-500 mt-1">
            {statsData.total > 0 ? ((statsData.up / statsData.total) * 100).toFixed(1) : 0}% Uptime
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Down</p>
          <p className="text-3xl font-bold text-destructive">{statsData.down}</p>
          <p className="text-xs text-destructive mt-1">
            {statsData.down > 0 ? "Needs Attention" : "All Good"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Avg. Response</p>
          <p className="text-3xl font-bold">{statsData.avgResponse}ms</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={loadWebsites} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Websites Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search websites by name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-md text-sm"
          >
            <option value="created_at">Sort: Date Created</option>
            <option value="name">Sort: Name</option>
            <option value="url">Sort: URL</option>
            <option value="uptime">Sort: Uptime</option>
            <option value="response_time">Sort: Response Time</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
            <TagIcon className="h-4 w-4 mr-2" />
            Tags ({selectedTagIds.length})
          </Button>

          {(searchQuery || statusFilter !== 'all' || selectedTagIds.length > 0 || sortBy !== 'created_at' || sortOrder !== 'desc') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {selectedTagIds.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedTagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              return tag ? (
                <span key={tagId} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
                  {tag.name}
                  <button onClick={() => toggleTag(tagId)} className="hover:text-primary/70">×</button>
                </span>
              ) : null
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {websites.length} website{websites.length !== 1 ? 's' : ''}
          </p>
          <div
            className={`flex items-center gap-2 text-sm ${
              isConnected ? "text-green-500" : "text-gray-500"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-500"}`} />
            {isConnected ? "Live Updates" : "Connecting..."}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                  WEBSITE NAME
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">URL</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">STATUS</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                  LAST CHECK
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                  RESPONSE
                </th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">INTERVAL</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {websites.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || selectedTagIds.length > 0 ? (
                      <>
                        <p className="mb-2">No websites match your filters</p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </>
                    ) : (
                      "No websites yet. Click 'Add Website' to start monitoring."
                    )}
                  </td>
                </tr>
              ) : (
                websites.map((website) => (
                  <tr
                    key={website.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">◆</span>
                        <span className="font-semibold text-foreground">{website.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground text-xs hover:text-primary flex items-center gap-1"
                      >
                        {website.url.substring(0, 40)}
                        {website.url.length > 40 ? "..." : ""}
                        <ExternalLink size={12} />
                      </a>
                    </td>
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
                    <td className="py-4 px-4 text-muted-foreground text-xs">
                      {website.last_checked_at
                        ? new Date(website.last_checked_at).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="py-4 px-4 text-foreground font-semibold">
                      {website.last_response_time ? `${website.last_response_time}ms` : "–"}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">
                      {website.monitoring_interval}s
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/monitor/${website.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(website)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(website)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Website Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Website</DialogTitle>
            <DialogDescription>
              Configure a new website to monitor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWebsite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Website"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Monitoring Interval (seconds)
              </label>
              <Input
                type="number"
                value={formData.monitoring_interval}
                onChange={(e) =>
                  setFormData({ ...formData, monitoring_interval: parseInt(e.target.value) })
                }
                min="10"
                max="3600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Timeout Threshold (ms)
              </label>
              <Input
                type="number"
                value={formData.timeout_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, timeout_threshold: parseInt(e.target.value) })
                }
                min="100"
                max="60000"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {submitting ? "Adding..." : "Add Website"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Website Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>
              Update website monitoring configuration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditWebsite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Website"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Monitoring Interval (seconds)
              </label>
              <Input
                type="number"
                value={formData.monitoring_interval}
                onChange={(e) =>
                  setFormData({ ...formData, monitoring_interval: parseInt(e.target.value) })
                }
                min="10"
                max="3600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Timeout Threshold (ms)
              </label>
              <Input
                type="number"
                value={formData.timeout_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, timeout_threshold: parseInt(e.target.value) })
                }
                min="100"
                max="60000"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{selectedWebsite?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteWebsite}
              className="bg-destructive hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter by Tags</DialogTitle>
            <DialogDescription>
              Select tags to filter your websites
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags available</p>
            ) : (
              tags.map(tag => (
                <label key={tag.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{tag.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    ({tag.website_count || 0})
                  </span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
