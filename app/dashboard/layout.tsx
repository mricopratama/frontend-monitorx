"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Settings, Bell, Menu, X } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingFallback } from "@/components/loading-fallback"
import { ThemeToggle } from "@/components/theme-toggle"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} bg-card border-r border-border transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">◆</div>
            <span className="hidden sm:inline">MonitorPro</span>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground mb-4">MAIN MENU</div>
          <NavLink href="/dashboard" icon="▭" label="Dashboard" active={pathname === "/dashboard"} />
          <NavLink href="/dashboard/websites" icon="◐" label="Websites" active={pathname === "/dashboard/websites"} />
          <NavLink href="/dashboard/alerts" icon="●" label="Alerts" active={pathname === "/dashboard/alerts"} />
          <NavLink href="/dashboard/logs" icon="▬" label="Logs" active={pathname === "/dashboard/logs"} />
          <NavLink href="/dashboard/analytics" icon="▨" label="Analytics" active={pathname === "/dashboard/analytics"} />

          <div className="text-xs font-semibold text-muted-foreground mb-4 mt-6">INTEGRATIONS</div>
          <NavLink href="/dashboard/webhooks" icon="🔗" label="Webhooks" active={pathname === "/dashboard/webhooks"} />
          <NavLink href="/dashboard/notifications" icon="📧" label="Notifications" active={pathname === "/dashboard/notifications"} />
          
          <div className="text-xs font-semibold text-muted-foreground mb-4 mt-6">SYSTEM</div>
          <NavLink href="/dashboard/settings" icon="⚙" label="Settings" active={pathname === "/dashboard/settings"} />
          <NavLink href="/dashboard/api-status" icon="◎" label="API Status" active={pathname === "/dashboard/api-status"} />
          <NavLink href="/dashboard/support" icon="?" label="Support" active={pathname === "/dashboard/support"} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  id="search-input"
                  name="search"
                  type="text"
                  placeholder="Search logs, metrics..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="text-muted-foreground hover:text-foreground">
              <Bell size={20} />
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback message="Loading content..." />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback fullScreen message="Loading dashboard..." />}>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </ErrorBoundary>
  )
}

function NavLink({ 
  icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: string; 
  label: string; 
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-primary/10 text-primary font-semibold' 
          : 'text-foreground hover:bg-secondary'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
