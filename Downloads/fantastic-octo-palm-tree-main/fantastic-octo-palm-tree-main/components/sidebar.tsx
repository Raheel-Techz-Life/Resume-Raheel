"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Network,
  Shield,
  FileSearch,
  Settings,
  ChevronRight,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Target,
  CheckCircle,
  BarChart3,
} from "lucide-react"

const afifNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Anomaly Detection", href: "/dashboard/anomalies", icon: AlertTriangle, badge: "Live" },
  { name: "Registration Hubs", href: "/dashboard/hubs", icon: Building2 },
  { name: "Network Analysis", href: "/dashboard/network", icon: Network },
  { name: "Investigation Cases", href: "/dashboard/cases", icon: FileSearch },
  { name: "Audit Trail", href: "/dashboard/audit", icon: Shield },
]

const profNavigation = [
  { name: "Dashboard", href: "/prof", icon: LayoutDashboard },
  { name: "Migration Pressure", href: "/prof/migration", icon: MapPin, badge: "Live" },
  { name: "Demand Forecasting", href: "/prof/forecasts", icon: TrendingUp },
  { name: "Recommendations", href: "/prof/recommendations", icon: Target },
  { name: "Policy Actions", href: "/prof/policies", icon: CheckCircle },
]

const afifCapabilities = [
  { name: "Hub Detection", desc: "Registration spikes" },
  { name: "Network Graph", desc: "Identity linking" },
  { name: "Risk Alerts", desc: "Graduated response" },
  { name: "Tamper Logs", desc: "Immutable audit" },
]

const profCapabilities = [
  { name: "Pressure Index", desc: "Stressed districts" },
  { name: "Demand Forecast", desc: "Predictive load" },
  { name: "Auto Recommend", desc: "Vans, staff, funds" },
  { name: "Feedback Loop", desc: "Policy outcomes" },
]

interface SidebarProps {
  variant?: "afif" | "prof"
}

export function Sidebar({ variant = "afif" }: SidebarProps) {
  const pathname = usePathname()
  const isProf = variant === "prof"
  const navigation = isProf ? profNavigation : afifNavigation
  const capabilities = isProf ? profCapabilities : afifCapabilities

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", isProf ? "bg-primary" : "bg-destructive")}>
          {isProf ? <BarChart3 className="h-5 w-5 text-primary-foreground" /> : <ShieldAlert className="h-5 w-5 text-destructive-foreground" />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">{isProf ? "PROF" : "AFIF"}</span>
          <span className="text-xs text-muted-foreground">{isProf ? "Resource Optimization" : "Fraud Intelligence"}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isProf ? "Resource Planning" : "Fraud Detection"}
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", isProf ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive")}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </Link>
          )
        })}

        <div className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Capabilities
        </div>
        {capabilities.map((item) => (
          <div key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="flex-1">{item.name}</span>
            <span className="text-[10px]">{item.desc}</span>
          </div>
        ))}

        {/* Switch Framework Link */}
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <Link
            href={isProf ? "/dashboard" : "/prof"}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50"
          >
            {isProf ? <ShieldAlert className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            <span>Switch to {isProf ? "AFIF" : "PROF"}</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          href={isProf ? "/prof/settings" : "/dashboard/settings"}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}

// Alias for compatibility
export const AppSidebar = Sidebar
