"use client"

import { useEffect, useState } from 'react'

interface PushNotificationOptions {
  onSubscribed?: (subscription: PushSubscription) => void
  onError?: (error: Error) => void
  vapidPublicKey?: string
}

export function usePushNotifications(options: PushNotificationOptions = {}) {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)
    setPermission(Notification.permission)

    if (supported) {
      checkExistingSubscription()
    }
  }, [])

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSub = await registration.pushManager.getSubscription()
      setSubscription(existingSub)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      const error = new Error('Push notifications not supported')
      options.onError?.(error)
      throw error
    }

    setLoading(true)

    try {
      // Request permission first
      const perm = await requestPermission()
      if (perm !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Register service worker
      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        await navigator.serviceWorker.ready
      }

      // Subscribe to push notifications
      const vapidPublicKey = options.vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      })

      setSubscription(sub)
      options.onSubscribed?.(sub)
      
      return sub
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to subscribe')
      options.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      return false
    }

    setLoading(true)

    try {
      const success = await subscription.unsubscribe()
      if (success) {
        setSubscription(null)
      }
      return success
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to unsubscribe')
      options.onError?.(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async (title: string, body: string) => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'test-notification'
    })
  }

  return {
    isSupported,
    subscription,
    permission,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
    isSubscribed: !!subscription
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
