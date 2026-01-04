"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Activity, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api/client"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "down"
  responseTime: number
  lastChecked: Date
}

export default function ApiStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Authentication API",
      status: "operational",
      responseTime: 0,
      lastChecked: new Date()
    },
    {
      name: "Monitoring API",
      status: "operational",
      responseTime: 0,
      lastChecked: new Date()
    },
    {
      name: "Analytics API",
      status: "operational",
      responseTime: 0,
      lastChecked: new Date()
    },
    {
      name: "Alerts API",
      status: "operational",
      responseTime: 0,
      lastChecked: new Date()
    },
    {
      name: "WebSocket Service",
      status: "operational",
      responseTime: 0,
      lastChecked: new Date()
    }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkServices()
    const interval = setInterval(checkServices, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkServices = async () => {
    try {
      const startTime = Date.now()
      
      // Try to ping the API
      try {
        await apiClient.get("/health")
        const responseTime = Date.now() - startTime
        
        // Update all services as operational
        setServices(prev => prev.map(service => ({
          ...service,
          status: "operational",
          responseTime: responseTime,
          lastChecked: new Date()
        })))
      } catch (error) {
        // Mark services as down if health check fails
        setServices(prev => prev.map(service => ({
          ...service,
          status: "down",
          responseTime: 0,
          lastChecked: new Date()
        })))
      }
    } catch (err) {
      console.error("Failed to check services:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-50 border-green-200"
      case "degraded": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "down": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-5 w-5 text-green-600" />
      case "degraded": return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "down": return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const overallStatus = services.every(s => s.status === "operational") 
    ? "operational" 
    : services.some(s => s.status === "down") 
    ? "down" 
    : "degraded"

  const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Status</h1>
        <p className="text-gray-600">Real-time status of all API services</p>
      </div>

      {/* Overall Status */}
      <Card className={`p-6 mb-8 border-2 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(overallStatus)}
            <div>
              <h2 className="text-2xl font-bold capitalize">{overallStatus}</h2>
              <p className="text-sm opacity-80">All Systems {overallStatus === "operational" ? "Operational" : overallStatus === "degraded" ? "Degraded" : "Down"}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-sm opacity-80">Avg Response Time</p>
          </div>
        </div>
      </Card>

      {/* Service Status List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Service Details</h2>
        {services.map((service, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(service.status)}
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{service.status}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-sm">{service.responseTime}ms</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last checked: {service.lastChecked.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Status Legend */}
      <Card className="p-6 mt-8">
        <h3 className="font-semibold mb-4">Status Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Operational</p>
              <p className="text-sm text-gray-600">Service is working normally</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium">Degraded</p>
              <p className="text-sm text-gray-600">Service is experiencing issues</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium">Down</p>
              <p className="text-sm text-gray-600">Service is unavailable</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
