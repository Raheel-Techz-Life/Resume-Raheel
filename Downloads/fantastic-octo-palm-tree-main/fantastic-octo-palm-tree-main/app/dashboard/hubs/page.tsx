"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Building2, AlertTriangle, TrendingUp, MapPin } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Hub {
  hub_id: string
  name: string
  location: string
  region: string
  ip_address: string
  registrations_today: number
  average_daily: number
  risk_level: "low" | "medium" | "high" | "critical"
  spike_detected: boolean
  last_activity: string
}

interface HubSpike {
  hub_id: string
  hub_name: string
  location: string
  current_registrations: number
  baseline: number
  deviation_percent: number
  spike_time: string
  recommended_action: string
}

interface IPAnalysis {
  ip_address: string
  total_registrations: number
  unique_hubs: number
  hubs: string[]
  risk_assessment: string
  flagged: boolean
}

const riskColors = {
  low: "oklch(0.7 0.15 145)",
  medium: "oklch(0.75 0.18 85)",
  high: "oklch(0.65 0.22 25)",
  critical: "oklch(0.6 0.22 15)",
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([])
  const [spikes, setSpikes] = useState<HubSpike[]>([])
  const [ipAnalysis, setIPAnalysis] = useState<IPAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"hubs" | "spikes" | "ip">("hubs")

  useEffect(() => {
    async function fetchData() {
      try {
        const [hubsRes, spikesRes, ipRes] = await Promise.all([
          fetch("http://localhost:8000/afif/hubs"),
          fetch("http://localhost:8000/afif/hubs/spikes"),
          fetch("http://localhost:8000/afif/ip-analysis"),
        ])

        if (hubsRes.ok) setHubs(await hubsRes.json())
        if (spikesRes.ok) setSpikes(await spikesRes.json())
        if (ipRes.ok) setIPAnalysis(await ipRes.json())
      } catch (error) {
        console.error("Failed to fetch hub data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const hubColumns: Column<Hub>[] = [
    { key: "hub_id", label: "Hub ID", render: (row) => <span className="font-mono text-xs">{row.hub_id}</span> },
    { key: "name", label: "Name" },
    { key: "location", label: "Location", render: (row) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span>{row.location}</span>
      </div>
    )},
    { key: "registrations_today", label: "Registrations", render: (row) => (
      <div className="text-right">
        <span className="font-semibold">{row.registrations_today}</span>
        <span className="text-xs text-muted-foreground ml-1">/ {row.average_daily} avg</span>
      </div>
    )},
    { key: "risk_level", label: "Risk Level", render: (row) => <StatusBadge status={row.risk_level} /> },
    { key: "spike_detected", label: "Spike", render: (row) => (
      row.spike_detected ? (
        <span className="inline-flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-3 w-3" /> Yes
        </span>
      ) : (
        <span className="text-muted-foreground">No</span>
      )
    )},
  ]

  const spikeColumns: Column<HubSpike>[] = [
    { key: "hub_name", label: "Hub" },
    { key: "location", label: "Location" },
    { key: "current_registrations", label: "Current", render: (row) => (
      <span className="font-semibold text-destructive">{row.current_registrations}</span>
    )},
    { key: "baseline", label: "Baseline" },
    { key: "deviation_percent", label: "Deviation", render: (row) => (
      <span className={`font-medium ${row.deviation_percent > 100 ? "text-destructive" : "text-warning"}`}>
        +{row.deviation_percent.toFixed(1)}%
      </span>
    )},
    { key: "recommended_action", label: "Action", render: (row) => (
      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{row.recommended_action}</span>
    )},
  ]

  const ipColumns: Column<IPAnalysis>[] = [
    { key: "ip_address", label: "IP Address", render: (row) => (
      <span className="font-mono text-xs">{row.ip_address}</span>
    )},
    { key: "total_registrations", label: "Registrations" },
    { key: "unique_hubs", label: "Unique Hubs" },
    { key: "risk_assessment", label: "Risk", render: (row) => (
      <StatusBadge status={row.risk_assessment as "low" | "medium" | "high"} />
    )},
    { key: "flagged", label: "Flagged", render: (row) => (
      row.flagged ? (
        <span className="text-destructive font-medium">⚠️ Yes</span>
      ) : (
        <span className="text-muted-foreground">No</span>
      )
    )},
  ]

  const riskDistribution = [
    { name: "Low", value: hubs.filter(h => h.risk_level === "low").length, color: riskColors.low },
    { name: "Medium", value: hubs.filter(h => h.risk_level === "medium").length, color: riskColors.medium },
    { name: "High", value: hubs.filter(h => h.risk_level === "high").length, color: riskColors.high },
    { name: "Critical", value: hubs.filter(h => h.risk_level === "critical").length, color: riskColors.critical },
  ]

  const regionData = hubs.reduce((acc, hub) => {
    const existing = acc.find(r => r.region === hub.region)
    if (existing) {
      existing.registrations += hub.registrations_today
      existing.hubs += 1
    } else {
      acc.push({ region: hub.region, registrations: hub.registrations_today, hubs: 1 })
    }
    return acc
  }, [] as { region: string; registrations: number; hubs: number }[])

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Registration Hubs" description="Monitor registration centers and detect anomalies" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading hub data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Registration Hubs" description="Monitor registration centers and detect anomalies" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Hubs"
            value={hubs.length.toString()}
            icon={Building2}
            change={{ value: hubs.filter(h => h.spike_detected).length, label: "with spikes" }}
          />
          <MetricCard
            title="Active Spikes"
            value={spikes.length.toString()}
            icon={AlertTriangle}
            change={{ value: spikes.filter(s => s.deviation_percent > 100).length, label: "critical" }}
          />
          <MetricCard
            title="High Risk Hubs"
            value={hubs.filter(h => h.risk_level === "high" || h.risk_level === "critical").length.toString()}
            icon={TrendingUp}
            change={{ value: hubs.filter(h => h.risk_level === "critical").length, label: "critical" }}
          />
          <MetricCard
            title="Flagged IPs"
            value={ipAnalysis.filter(ip => ip.flagged).length.toString()}
            icon={MapPin}
            change={{ value: ipAnalysis.length, label: "total IPs" }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Risk Distribution">
            <div className="h-[240px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">{hubs.length}</span>
                <span className="text-xs text-muted-foreground">Hubs</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Registrations by Region">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="registrations" fill="oklch(0.65 0.2 265)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: "hubs", label: "All Hubs" },
            { key: "spikes", label: `Active Spikes (${spikes.length})` },
            { key: "ip", label: `IP Analysis (${ipAnalysis.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                selectedTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Tables */}
        <ChartCard title={selectedTab === "hubs" ? "Registration Hubs" : selectedTab === "spikes" ? "Detected Spikes" : "IP Address Analysis"}>
          {selectedTab === "hubs" && <DataTable columns={hubColumns} data={hubs} />}
          {selectedTab === "spikes" && <DataTable columns={spikeColumns} data={spikes} />}
          {selectedTab === "ip" && <DataTable columns={ipColumns} data={ipAnalysis} />}
        </ChartCard>
      </div>
    </div>
  )
}
