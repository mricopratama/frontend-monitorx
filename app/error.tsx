"use client"

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or return to the dashboard.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-secondary/50 rounded-lg p-4 text-sm">
            <summary className="cursor-pointer font-semibold mb-2">
              Error Details (Development Only)
            </summary>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <strong>Message:</strong>
                <pre className="mt-1 whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <strong>Digest:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-words">
                    {error.digest}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
