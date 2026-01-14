"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { MapPin, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface District {
  district_id: string
  name: string
  state: string
  population: number
  migration_inflow: number
  migration_outflow: number
  pressure_index: number
  pressure_level: string
  resource_score: number
  infrastructure_gap: number
  last_updated: string
}

interface MigrationSummary {
  total_districts: number
  pressure_breakdown: Record<string, number>
  avg_pressure_index: number
  top_stressed: District[]
  total_migration_inflow: number
  total_migration_outflow: number
}

const pressureColors = {
  low: "oklch(0.7 0.15 145)",
  moderate: "oklch(0.75 0.18 85)",
  high: "oklch(0.65 0.22 25)",
  critical: "oklch(0.6 0.22 15)",
}

export default function MigrationPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [summary, setSummary] = useState<MigrationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [districtsRes, summaryRes] = await Promise.all([
          fetch("http://localhost:8001/prof/districts"),
          fetch("http://localhost:8001/prof/migration/summary"),
        ])
        
        if (districtsRes.ok) setDistricts(await districtsRes.json())
        if (summaryRes.ok) setSummary(await summaryRes.json())
      } catch (error) {
        console.error("Failed to fetch migration data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const districtColumns: Column<District>[] = [
    { key: "district_id", label: "ID", render: (row) => <span className="font-mono text-xs">{row.district_id}</span> },
    { key: "name", label: "District" },
    { key: "state", label: "State" },
    { key: "population", label: "Population", render: (row) => row.population.toLocaleString() },
    { key: "migration_inflow", label: "Inflow", render: (row) => (
      <span className="text-success">+{row.migration_inflow.toLocaleString()}</span>
    )},
    { key: "migration_outflow", label: "Outflow", render: (row) => (
      <span className="text-destructive">-{row.migration_outflow.toLocaleString()}</span>
    )},
    { key: "pressure_index", label: "Pressure", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{ 
              width: `${row.pressure_index}%`,
              backgroundColor: pressureColors[row.pressure_level as keyof typeof pressureColors]
            }}
          />
        </div>
        <span className="text-xs">{row.pressure_index.toFixed(1)}</span>
      </div>
    )},
    { key: "pressure_level", label: "Level", render: (row) => (
      <StatusBadge status={row.pressure_level as "low" | "medium" | "high" | "critical"} />
    )},
  ]

  const pressureData = summary?.pressure_breakdown
    ? Object.entries(summary.pressure_breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: pressureColors[name as keyof typeof pressureColors] || "oklch(0.5 0 0)",
      }))
    : []

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Migration Pressure Index" description="District-level migration stress analysis" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading migration data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Migration Pressure Index" description="District-level migration stress analysis" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Districts"
            value={summary?.total_districts.toString() || "0"}
            icon={MapPin}
            change={{ value: summary?.top_stressed.length || 0, label: "stressed" }}
          />
          <MetricCard
            title="Avg Pressure Index"
            value={(summary?.avg_pressure_index || 0).toFixed(1)}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Inflow"
            value={(summary?.total_migration_inflow || 0).toLocaleString()}
            icon={Users}
          />
          <MetricCard
            title="Total Outflow"
            value={(summary?.total_migration_outflow || 0).toLocaleString()}
            icon={AlertTriangle}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Pressure Level Distribution">
            <div className="h-[240px] flex items-center justify-center relative">
              {pressureData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pressureData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {pressureData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">{summary?.total_districts || 0}</span>
                    <span className="text-xs text-muted-foreground">Districts</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pressureData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Top Stressed Districts">
            {summary?.top_stressed && summary.top_stressed.length > 0 ? (
              <div className="space-y-3">
                {summary.top_stressed.slice(0, 5).map((district) => (
                  <div key={district.district_id} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate">{district.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${district.pressure_index}%`,
                          backgroundColor: pressureColors[district.pressure_level as keyof typeof pressureColors]
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{district.pressure_index.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">No stressed districts</div>
            )}
          </ChartCard>
        </div>

        {/* Districts Table */}
        <ChartCard title="All Districts">
          {districts.length > 0 ? (
            <DataTable columns={districtColumns} data={districts} />
          ) : (
            <div className="text-center text-muted-foreground py-8">No district data available. Integrate your dataset to see migration pressure analysis.</div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
