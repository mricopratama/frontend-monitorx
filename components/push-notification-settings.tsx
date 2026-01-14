"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePushNotifications } from "@/lib/hooks/use-push-notifications"
import { Bell, BellOff, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useState } from "react"

export function PushNotificationSettings() {
  const showToast = (title: string, description: string) => {
    // Simple toast implementation - can be replaced with your toast library
    console.log(`${title}: ${description}`)
  }
  const {
    isSupported,
    subscription,
    permission,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isSubscribed
  } = usePushNotifications({
    onSubscribed: (sub) => {
      // Send subscription to backend
      sendSubscriptionToServer(sub)
      showToast("Notifications Enabled", "You'll now receive push notifications for critical alerts")
    },
    onError: (error) => {
      showToast("Error", error.message)
    }
  })

  const [testLoading, setTestLoading] = useState(false)

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      // In real implementation, send to your API
      // await fetch('/api/v1/push/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription)
      // })
      console.log('Subscription to be sent to server:', subscription.toJSON())
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  const handleToggleNotifications = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe()
        showToast("Notifications Disabled", "You won't receive push notifications anymore")
      } else {
        await subscribe()
      }
    } catch (error) {
      // Error already handled in hook
    }
  }

  const handleTestNotification = async () => {
    setTestLoading(true)
    try {
      await sendTestNotification(
        'MonitorX Test Alert',
        'This is a test notification. If you see this, push notifications are working correctly!'
      )
      showToast("Test Sent", "Check your system notifications")
    } catch (error) {
      showToast("Error", "Failed to send test notification")
    } finally {
      setTestLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Browser push notifications for critical alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Push notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive instant browser notifications for critical monitoring alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Permission Status</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' && 'Notifications are allowed'}
              {permission === 'denied' && 'Notifications are blocked'}
              {permission === 'default' && 'Permission not requested yet'}
            </p>
          </div>
          <div>
            {permission === 'granted' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {permission === 'denied' && <XCircle className="w-6 h-6 text-red-500" />}
            {permission === 'default' && <Bell className="w-6 h-6 text-gray-400" />}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Subscription Status</p>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? 'You are subscribed to push notifications' : 'Not subscribed'}
            </p>
          </div>
          <div>
            {isSubscribed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleToggleNotifications}
            disabled={loading || permission === 'denied'}
            className="flex-1"
            variant={isSubscribed ? "destructive" : "default"}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubscribed ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Disable Notifications
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </>
            )}
          </Button>

          {isSubscribed && (
            <Button
              onClick={handleTestNotification}
              disabled={testLoading}
              variant="outline"
            >
              {testLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Notifications are blocked.</strong> Please enable notifications in your browser settings to receive alerts.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> You'll receive push notifications for critical events like website downtime, 
            even when MonitorX is not open in your browser.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
