"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Network, Users, AlertTriangle, Link2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface NetworkCluster {
  cluster_id: string
  size: number
  risk_level: "low" | "medium" | "high" | "critical"
  central_node: string
  connections: number
  fraud_indicators: string[]
  created_at: string
}

interface LinkedIdentity {
  uid: string
  name: string
  connection_type: string
  connection_strength: number
  shared_attributes: string[]
  risk_score: number
}

interface NetworkRisk {
  uid: string
  network_risk_score: number
  total_connections: number
  suspicious_connections: number
  risk_factors: string[]
  recommendation: string
}

export default function NetworkPage() {
  const [clusters, setClusters] = useState<NetworkCluster[]>([])
  const [linkedIdentities, setLinkedIdentities] = useState<LinkedIdentity[]>([])
  const [networkRisk, setNetworkRisk] = useState<NetworkRisk | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchUid, setSearchUid] = useState("")
  const [searchedUid, setSearchedUid] = useState("")

  useEffect(() => {
    async function fetchClusters() {
      try {
        const response = await fetch("http://localhost:8000/afif/network/clusters")
        if (response.ok) {
          setClusters(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch clusters:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClusters()
  }, [])

  const searchNetwork = async () => {
    if (!searchUid.trim()) return

    setLoading(true)
    try {
      const [linkedRes, riskRes] = await Promise.all([
        fetch(`http://localhost:8000/afif/network/linked/${searchUid}`),
        fetch(`http://localhost:8000/afif/network/risk/${searchUid}`),
      ])

      if (linkedRes.ok) {
        setLinkedIdentities(await linkedRes.json())
      }
      if (riskRes.ok) {
        setNetworkRisk(await riskRes.json())
      }
      setSearchedUid(searchUid)
    } catch (error) {
      console.error("Failed to search network:", error)
    } finally {
      setLoading(false)
    }
  }

  const clusterColumns: Column<NetworkCluster>[] = [
    { key: "cluster_id", label: "Cluster ID", render: (row) => (
      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{row.cluster_id}</span>
    )},
    { key: "size", label: "Size", render: (row) => (
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3 text-muted-foreground" />
        <span className="font-semibold">{row.size}</span>
      </div>
    )},
    { key: "central_node", label: "Central Node", render: (row) => (
      <span className="font-mono text-xs">{row.central_node}</span>
    )},
    { key: "connections", label: "Connections" },
    { key: "risk_level", label: "Risk Level", render: (row) => <StatusBadge status={row.risk_level} /> },
    { key: "fraud_indicators", label: "Fraud Indicators", render: (row) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {row.fraud_indicators.slice(0, 2).map((indicator: string, i: number) => (
          <span key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
            {indicator}
          </span>
        ))}
        {row.fraud_indicators.length > 2 && (
          <span className="text-xs text-muted-foreground">+{row.fraud_indicators.length - 2}</span>
        )}
      </div>
    )},
  ]

  const linkedColumns: Column<LinkedIdentity>[] = [
    { key: "uid", label: "UID", render: (row) => (
      <span className="font-mono text-xs">{row.uid}</span>
    )},
    { key: "name", label: "Name" },
    { key: "connection_type", label: "Connection", render: (row) => (
      <div className="flex items-center gap-1">
        <Link2 className="h-3 w-3 text-muted-foreground" />
        <span className="capitalize">{row.connection_type.replace("_", " ")}</span>
      </div>
    )},
    { key: "connection_strength", label: "Strength", render: (row) => (
      <div className="w-20">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${row.connection_strength * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{(row.connection_strength * 100).toFixed(0)}%</span>
      </div>
    )},
    { key: "shared_attributes", label: "Shared Attributes", render: (row) => (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {row.shared_attributes.map((attr: string, i: number) => (
          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {attr}
          </span>
        ))}
      </div>
    )},
    { key: "risk_score", label: "Risk Score", render: (row) => (
      <span className={`font-semibold ${row.risk_score > 70 ? "text-destructive" : row.risk_score > 40 ? "text-warning" : "text-success"}`}>
        {row.risk_score}
      </span>
    )},
  ]

  const totalNodes = clusters.reduce((sum, c) => sum + c.size, 0)
  const suspiciousClusters = clusters.filter(c => c.risk_level === "high" || c.risk_level === "critical").length
  const totalConnections = clusters.reduce((sum, c) => sum + c.connections, 0)

  if (loading && clusters.length === 0) {
    return (
      <div className="flex flex-col">
        <Header title="Network Analysis" description="Analyze connected identities and suspicious clusters" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading network data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Network Analysis" description="Analyze connected identities and suspicious clusters" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Clusters"
            value={clusters.length.toString()}
            icon={Network}
            change={{ value: suspiciousClusters, label: "suspicious" }}
          />
          <MetricCard
            title="Network Nodes"
            value={totalNodes.toString()}
            icon={Users}
            change={{ value: clusters.length, label: "clusters" }}
          />
          <MetricCard
            title="Total Connections"
            value={totalConnections.toString()}
            icon={Link2}
            change={{ value: Math.round(totalConnections / clusters.length) || 0, label: "avg per cluster" }}
          />
          <MetricCard
            title="High Risk Clusters"
            value={suspiciousClusters.toString()}
            icon={AlertTriangle}
            change={{ value: clusters.filter(c => c.risk_level === "critical").length, label: "critical" }}
          />
        </div>

        {/* Search */}
        <ChartCard title="Identity Network Search">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter UID to analyze network connections..."
                value={searchUid}
                onChange={(e) => setSearchUid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchNetwork()}
                className="pl-9"
              />
            </div>
            <button
              onClick={searchNetwork}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Analyze
            </button>
          </div>

          {networkRisk && (
            <div className="mb-4 p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-3">Network Risk Assessment for {searchedUid}</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <p className={`text-2xl font-bold ${networkRisk.network_risk_score > 70 ? "text-destructive" : networkRisk.network_risk_score > 40 ? "text-warning" : "text-success"}`}>
                    {networkRisk.network_risk_score}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Total Connections</span>
                  <p className="text-2xl font-bold">{networkRisk.total_connections}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Suspicious</span>
                  <p className="text-2xl font-bold text-destructive">{networkRisk.suspicious_connections}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Recommendation</span>
                  <p className="text-sm font-medium">{networkRisk.recommendation}</p>
                </div>
              </div>
              {networkRisk.risk_factors.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-muted-foreground">Risk Factors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {networkRisk.risk_factors.map((factor, i) => (
                      <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {linkedIdentities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Linked Identities ({linkedIdentities.length})</h4>
              <DataTable columns={linkedColumns} data={linkedIdentities} />
            </div>
          )}

          {searchedUid && linkedIdentities.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-4">No linked identities found for this UID</p>
          )}
        </ChartCard>

        {/* Clusters Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clusters.slice(0, 6).map((cluster) => (
            <div
              key={cluster.cluster_id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{cluster.cluster_id}</span>
                <StatusBadge status={cluster.risk_level} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">Nodes</span>
                  <p className="font-semibold">{cluster.size}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Connections</span>
                  <p className="font-semibold">{cluster.connections}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {cluster.fraud_indicators.slice(0, 3).map((indicator, i) => (
                  <span key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All Clusters Table */}
        <ChartCard title="All Network Clusters">
          <DataTable columns={clusterColumns} data={clusters} />
        </ChartCard>
      </div>
    </div>
  )
}
