"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle2, BarChart3, Bell, Activity } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-semibold text-lg">MonitorX</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-500">System Operational</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Monitor Your Website <span className="text-blue-500">Performance</span> in Real-Time
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Ensure 99.9% uptime with instant alerts, detailed performance metrics, and global monitoring nodes. Don't
            let downtime cost you customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg h-12 px-8">Get Started Free</Button>
            </Link>
            <Button variant="outline" className="text-lg h-12 px-8 bg-transparent">
              Live Demo
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No credit card required</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="bg-card border border-border rounded-lg p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground ml-4">https://app-monitorx.io/dashboard</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background rounded p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  GLOBAL UPTIME
                </div>
                <div className="text-3xl font-bold mb-1">99.98%</div>
                <div className="text-xs text-green-500">↑ 0.02% this week</div>
              </div>
              <div className="bg-background rounded p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  AVG RESPONSE
                </div>
                <div className="text-3xl font-bold mb-1">124ms</div>
                <div className="text-xs text-green-500">↓ 12ms vs last hour</div>
              </div>
            </div>

            <div className="bg-background rounded p-4 border border-border/50 mb-6">
              <div className="text-xs text-muted-foreground mb-4">RESPONSE TIME (24H)</div>
              <div className="h-16 flex items-end gap-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded border border-border/50">
                <div className="text-sm">
                  <div className="text-muted-foreground text-xs mb-1">API Server (US-East)</div>
                  <div className="text-green-500 text-xs font-semibold">OPERATIONAL</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded border border-border/50">
                <div className="text-sm">
                  <div className="text-muted-foreground text-xs mb-1">Database Cluster</div>
                  <div className="text-yellow-500 text-xs font-semibold">HIGH LOAD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Complete Visibility for Your Tech Stack</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to keep your services online, performant, and reliable for your users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
                title: "Global Uptime Monitoring",
                description:
                  "Check availability from 30+ locations worldwide to ensure global access. We verify downtime from multiple nodes before alerting you.",
              },
              {
                icon: <Activity className="w-8 h-8 text-blue-500" />,
                title: "Deep Performance Tracking",
                description:
                  "Analyze load times, TTFB, and request latency. Identify bottlenecks before they affect your user experience and SEO rankings.",
              },
              {
                icon: <Bell className="w-8 h-8 text-blue-500" />,
                title: "Instant Notifications",
                description:
                  "Get alerted via Slack, SMS, Email, or Webhooks instantly when downtime is detected. Customize alert thresholds to reduce noise.",
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-card border-border/50 p-8 hover:border-border transition">
                {feature.icon}
                <h3 className="text-xl font-semibold mt-4 mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to improve your reliability?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join 10,000+ developers who trust MonitorX to keep their websites online and fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg h-12 px-8">Start Monitoring Now</Button>
            </Link>
            <Button variant="outline" className="text-lg h-12 px-8 bg-transparent">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-semibold">MonitorX</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 MonitorX Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
