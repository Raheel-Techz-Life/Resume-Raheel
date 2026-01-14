"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { AlertTriangle, ShieldAlert, Network, Building2, Shield, CheckCircle, Activity } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface DashboardStats {
  total_anomalies: number
  high_risk_cases: number
  cases_pending: number
  cases_resolved: number
  score_distribution: Record<string, number>
  type_breakdown: Record<string, number>
  region_breakdown: Record<string, number>
  alert_level_breakdown: Record<string, number>
  hub_statistics: {
    total_hubs: number
    spike_detected: number
    high_risk: number
  }
  network_statistics: {
    total_nodes: number
    suspicious_clusters: number
  }
  audit_log_entries: number
}

interface Anomaly {
  id: string
  type: string
  uid: string
  region: string
  fraud_score: number
  status: string
  detected_at: string
  alert_level: string
}

const getAlertConfig = (level: string) => {
  switch (level) {
    case "critical": return { status: "error" as const, label: "Critical" }
    case "enforcement": return { status: "error" as const, label: "Enforcement" }
    case "audit_required": return { status: "warning" as const, label: "Audit" }
    default: return { status: "info" as const, label: "Warning" }
  }
}

const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, anomaliesRes] = await Promise.all([
          fetch(`${API_BASE}/afif/dashboard`),
          fetch(`${API_BASE}/afif/anomalies?limit=5`),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (anomaliesRes.ok) setAnomalies(await anomaliesRes.json())
      } catch (error) {
        console.error("Failed to fetch AFIF data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const alertLevelData = stats ? [
    { name: "Critical", value: stats.alert_level_breakdown["critical"] || 0, color: "oklch(0.55 0.22 25)" },
    { name: "Enforcement", value: stats.alert_level_breakdown["enforcement"] || 0, color: "oklch(0.65 0.2 40)" },
    { name: "Audit Required", value: stats.alert_level_breakdown["audit_required"] || 0, color: "oklch(0.8 0.15 85)" },
    { name: "Soft Warning", value: stats.alert_level_breakdown["soft_warning"] || 0, color: "oklch(0.65 0.2 265)" },
  ] : []

  const regionData = stats ? Object.entries(stats.region_breakdown)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) : []

  const alertColumns = [
    { key: "id", label: "ID", className: "font-mono text-sm" },
    { key: "type", label: "Type", render: (item: Anomaly) => item.type.replace(/_/g, " ") },
    { key: "region", label: "Region" },
    {
      key: "alert_level",
      label: "Alert",
      render: (item: Anomaly) => {
        const config = getAlertConfig(item.alert_level)
        return <StatusBadge status={config.status} label={config.label} />
      },
    },
    { key: "detected_at", label: "Time", className: "text-muted-foreground", render: (item: Anomaly) => formatTimeAgo(item.detected_at) },
  ]

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="AFIF Dashboard" description="Loading..." />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-muted-foreground">Loading AFIF data...</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <Header title="AFIF Dashboard" description="Aadhaar Fraud Intelligence Framework - Real-time Monitoring" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Anomalies"
            value={stats?.total_anomalies.toLocaleString() || "0"}
            change={{ value: stats?.cases_pending || 0, label: "pending review" }}
            icon={AlertTriangle}
          />
          <MetricCard
            title="High Risk Cases"
            value={stats?.high_risk_cases.toLocaleString() || "0"}
            change={{ value: stats?.hub_statistics.spike_detected || 0, label: "hub spikes" }}
            icon={ShieldAlert}
          />
          <MetricCard
            title="Suspicious Clusters"
            value={stats?.network_statistics.suspicious_clusters.toLocaleString() || "0"}
            change={{ value: stats?.network_statistics.total_nodes || 0, label: "nodes" }}
            icon={Network}
          />
          <MetricCard
            title="Registration Hubs"
            value={stats?.hub_statistics.total_hubs.toLocaleString() || "0"}
            change={{ value: stats?.hub_statistics.high_risk || 0, label: "high risk" }}
            icon={Building2}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Alert Level Distribution" href="/dashboard/anomalies">
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {alertLevelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">{stats?.total_anomalies || 0}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {alertLevelData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Anomalies by Region" href="/dashboard/anomalies">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.55 0.22 25)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* System Health & Alerts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* AFIF Components Status */}
          <ChartCard title="System Components" className="lg:col-span-1">
            <div className="space-y-4">
              {[
                { name: "Anomaly Detection", status: "Operational", health: 99.8 },
                { name: "Hub Monitoring", status: "Operational", health: 98.5 },
                { name: "Network Analysis", status: "Operational", health: 97.2 },
                { name: "Risk Scoring", status: "Operational", health: 99.1 },
                { name: "Audit Logging", status: "Operational", health: 100 },
              ].map((component) => (
                <div key={component.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{component.name}</span>
                      <span className="text-xs text-muted-foreground">{component.health}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-success" style={{ width: `${component.health}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Recent Alerts */}
          <ChartCard title="Recent Anomalies" href="/dashboard/anomalies" className="lg:col-span-2">
            <DataTable columns={alertColumns} data={anomalies} />
          </ChartCard>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Audit Log</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats?.audit_log_entries || 0}</p>
            <p className="text-xs text-muted-foreground">tamper-evident entries</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Cases Resolved</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats?.cases_resolved || 0}</p>
            <p className="text-xs text-muted-foreground">this period</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Hub Spikes</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats?.hub_statistics.spike_detected || 0}</p>
            <p className="text-xs text-muted-foreground">registration anomalies</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium">High Risk Hubs</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats?.hub_statistics.high_risk || 0}</p>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </div>
        </div>
      </div>
    </div>
  )
}
