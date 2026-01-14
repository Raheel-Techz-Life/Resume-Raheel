"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { AlertTriangle, ShieldAlert, Clock, CheckCircle, Flag, Network, Building2, Shield } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface DashboardStats {
  total_anomalies: number
  high_risk_cases: number
  cases_pending: number
  cases_resolved: number
  score_distribution: Record<string, number>
  type_breakdown: Record<string, number>
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

interface RegistrationHub {
  hub_id: string
  name: string
  location: string
  state: string
  daily_registrations: number
  avg_registrations_per_day: number
  spike_detected: boolean
  risk_score: number
}

interface NetworkCluster {
  cluster_id: string
  size: number
  members: string[]
  is_suspicious: boolean
  avg_risk_propagation: number
  connection_types: string[]
  alert_level: string
}

interface AuditEntry {
  log_id: string
  timestamp: string
  action: string
  actor: string
  target_uid: string | null
  current_hash: string
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { status: "warning" as const, label: "Pending" }
    case "investigating":
      return { status: "info" as const, label: "Investigating" }
    case "confirmed":
      return { status: "error" as const, label: "Confirmed" }
    case "resolved":
      return { status: "success" as const, label: "Resolved" }
    default:
      return { status: "default" as const, label: status }
  }
}

const getAlertLevelConfig = (level: string) => {
  switch (level) {
    case "critical":
      return { status: "error" as const, label: "Critical" }
    case "enforcement":
      return { status: "error" as const, label: "Enforcement" }
    case "audit_required":
      return { status: "warning" as const, label: "Audit Required" }
    case "soft_warning":
      return { status: "info" as const, label: "Soft Warning" }
    default:
      return { status: "default" as const, label: level }
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

export default function AnomaliesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [hubs, setHubs] = useState<RegistrationHub[]>([])
  const [clusters, setClusters] = useState<NetworkCluster[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, anomaliesRes, hubsRes, clustersRes, auditRes] = await Promise.all([
          fetch(`${API_BASE}/afif/dashboard`),
          fetch(`${API_BASE}/afif/anomalies?limit=20`),
          fetch(`${API_BASE}/afif/hubs?limit=10`),
          fetch(`${API_BASE}/afif/network/clusters?suspicious_only=true`),
          fetch(`${API_BASE}/afif/audit-log?limit=10`),
        ])
        
        if (statsRes.ok) setStats(await statsRes.json())
        if (anomaliesRes.ok) setAnomalies(await anomaliesRes.json())
        if (hubsRes.ok) setHubs(await hubsRes.json())
        if (clustersRes.ok) setClusters(await clustersRes.json())
        if (auditRes.ok) setAuditLog(await auditRes.json())
      } catch (error) {
        console.error("Failed to fetch AFIF data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const scoreDistribution = stats ? [
    { range: "0-20", count: stats.score_distribution["0-20"] || 0, label: "Low Risk" },
    { range: "21-40", count: stats.score_distribution["21-40"] || 0, label: "Medium-Low" },
    { range: "41-60", count: stats.score_distribution["41-60"] || 0, label: "Medium" },
    { range: "61-80", count: stats.score_distribution["61-80"] || 0, label: "High" },
    { range: "81-100", count: stats.score_distribution["81-100"] || 0, label: "Critical" },
  ] : []

  const typeBreakdown = stats ? Object.entries(stats.type_breakdown).map(([type, count]) => ({
    type: type.replace(/_/g, " "),
    count,
  })).sort((a, b) => b.count - a.count).slice(0, 5) : []

  const anomalyColumns = [
    { key: "uid", label: "UID", className: "font-mono text-sm" },
    { key: "type", label: "Type", render: (item: Anomaly) => item.type.replace(/_/g, " ") },
    { key: "region", label: "Region" },
    {
      key: "fraud_score",
      label: "Score",
      render: (item: Anomaly) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                item.fraud_score >= 80 ? "bg-destructive" : item.fraud_score >= 60 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${item.fraud_score}%` }}
            />
          </div>
          <span className="text-sm">{Math.round(item.fraud_score)}</span>
        </div>
      ),
    },
    {
      key: "alert_level",
      label: "Alert",
      render: (item: Anomaly) => {
        const config = getAlertLevelConfig(item.alert_level)
        return <StatusBadge status={config.status} label={config.label} />
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: Anomaly) => {
        const config = getStatusConfig(item.status)
        return <StatusBadge status={config.status} label={config.label} />
      },
    },
    { 
      key: "detected_at", 
      label: "Detected", 
      className: "text-muted-foreground",
      render: (item: Anomaly) => formatTimeAgo(item.detected_at)
    },
  ]

  const hubColumns = [
    { key: "hub_id", label: "Hub ID", className: "font-mono text-sm" },
    { key: "name", label: "Name" },
    { key: "state", label: "State" },
    { key: "daily_registrations", label: "Daily Reg." },
    {
      key: "risk_score",
      label: "Risk",
      render: (item: RegistrationHub) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-12 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                item.risk_score >= 50 ? "bg-destructive" : item.risk_score >= 25 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${item.risk_score}%` }}
            />
          </div>
          <span className="text-sm">{Math.round(item.risk_score)}</span>
        </div>
      ),
    },
    {
      key: "spike_detected",
      label: "Spike",
      render: (item: RegistrationHub) => (
        <StatusBadge 
          status={item.spike_detected ? "error" : "success"} 
          label={item.spike_detected ? "Yes" : "No"} 
        />
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="AFIF - Fraud Intelligence" description="Loading..." />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-muted-foreground">Loading AFIF data...</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <Header title="AFIF - Fraud Intelligence" description="Registration Hub Detection • Network Analysis • Risk Alerts • Audit Trail" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Anomalies"
            value={stats?.total_anomalies.toLocaleString() || "0"}
            change={{ value: stats?.cases_pending || 0, label: "pending" }}
            icon={AlertTriangle}
          />
          <MetricCard
            title="High Risk Cases"
            value={stats?.high_risk_cases.toLocaleString() || "0"}
            change={{ value: stats?.hub_statistics.high_risk || 0, label: "high risk hubs" }}
            icon={ShieldAlert}
          />
          <MetricCard
            title="Suspicious Clusters"
            value={stats?.network_statistics.suspicious_clusters.toLocaleString() || "0"}
            change={{ value: stats?.network_statistics.total_nodes || 0, label: "nodes tracked" }}
            icon={Network}
          />
          <MetricCard
            title="Cases Resolved"
            value={stats?.cases_resolved.toLocaleString() || "0"}
            change={{ value: stats?.audit_log_entries || 0, label: "audit entries" }}
            icon={CheckCircle}
          />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="anomalies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="hubs">Registration Hubs</TabsTrigger>
            <TabsTrigger value="network">Network Clusters</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies" className="space-y-6">
            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Fraud Score Distribution">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                        labelStyle={{ color: "oklch(0.95 0 0)" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={index} fill={index >= 3 ? "oklch(0.55 0.22 25)" : index >= 2 ? "oklch(0.8 0.15 85)" : "oklch(0.65 0.2 265)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Anomaly Types">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeBreakdown} layout="vertical" margin={{ top: 10, right: 10, left: 100, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                      <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} width={95} />
                      <Tooltip contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }} />
                      <Bar dataKey="count" fill="oklch(0.65 0.2 265)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Anomalies Table */}
            <ChartCard title="Detected Anomalies">
              <DataTable columns={anomalyColumns} data={anomalies} />
            </ChartCard>
          </TabsContent>

          <TabsContent value="hubs" className="space-y-6">
            {/* Hub Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Hubs</p>
                  <p className="mt-1 text-2xl font-bold">{stats?.hub_statistics.total_hubs || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Spikes Detected</p>
                  <p className="mt-1 text-2xl font-bold text-warning">{stats?.hub_statistics.spike_detected || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">High Risk Hubs</p>
                  <p className="mt-1 text-2xl font-bold text-destructive">{stats?.hub_statistics.high_risk || 0}</p>
                </CardContent>
              </Card>
            </div>

            <ChartCard title="Registration Hubs">
              <DataTable columns={hubColumns} data={hubs} />
            </ChartCard>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map((cluster) => (
                <Card key={cluster.cluster_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono">{cluster.cluster_id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Members</span>
                        <span className="font-bold">{cluster.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Risk</span>
                        <span className="font-bold">{(cluster.avg_risk_propagation * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cluster.connection_types.map((type) => (
                          <span key={type} className="text-xs bg-muted px-2 py-0.5 rounded">{type}</span>
                        ))}
                      </div>
                      <StatusBadge 
                        status={cluster.is_suspicious ? "error" : "success"} 
                        label={cluster.is_suspicious ? "Suspicious" : "Normal"} 
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <ChartCard title="Tamper-Evident Audit Log">
              <div className="space-y-2">
                {auditLog.map((entry) => (
                  <div key={entry.log_id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-xs text-muted-foreground">by {entry.actor}</span>
                      </div>
                      {entry.target_uid && (
                        <p className="text-sm text-muted-foreground">Target: {entry.target_uid}</p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                        Hash: {entry.current_hash.slice(0, 16)}...
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
