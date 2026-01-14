// Service Worker for Push Notifications
const CACHE_NAME = 'monitorx-v1'

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    return
  }

  const data = event.data.json()
  const options = {
    body: data.body || 'New alert from MonitorX',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'monitorx-alert',
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/check-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/close-icon.png'
      }
    ],
    requireInteraction: data.priority === 'high'
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MonitorX Alert', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed')
  // Handle subscription change
  event.waitUntil(
    fetch('/api/push/subscription-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        old: event.oldSubscription,
        new: event.newSubscription
      })
    })
  )
})
