"use client"

import { Loader2 } from 'lucide-react'

interface LoadingFallbackProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingFallback({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingFallbackProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Skeleton loader for dashboard cards
 */
export function DashboardCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-secondary rounded w-1/2"></div>
        <div className="h-8 bg-secondary rounded w-3/4"></div>
        <div className="h-3 bg-secondary rounded w-1/3"></div>
      </div>
    </div>
  )
}

/**
 * Skeleton loader for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-secondary rounded"></div>
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton loader for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4 border-b border-border animate-pulse">
      <div className="w-10 h-10 bg-secondary rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
        <div className="h-3 bg-secondary rounded w-1/2"></div>
      </div>
    </div>
  )
}
