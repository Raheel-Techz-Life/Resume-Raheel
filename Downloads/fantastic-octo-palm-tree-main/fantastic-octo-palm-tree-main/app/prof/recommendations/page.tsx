"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { Lightbulb, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"

interface ResourceRecommendation {
  recommendation_id: string
  district_id: string
  district_name: string
  resource_type: string
  action: string
  quantity: number
  unit: string
  priority: string
  estimated_impact: number
  estimated_cost: number
  status: string
  generated_at: string
  reasoning: string
}

interface RecommendationSummary {
  total: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  by_resource_type: Record<string, number>
  total_estimated_cost: number
  avg_estimated_impact: number
}

const priorityColors: Record<string, string> = {
  critical: "oklch(0.6 0.22 15)",
  high: "oklch(0.65 0.22 25)",
  medium: "oklch(0.75 0.18 85)",
  low: "oklch(0.7 0.15 145)",
}

const statusColors: Record<string, string> = {
  pending: "oklch(0.75 0.18 85)",
  approved: "oklch(0.65 0.18 145)",
  implemented: "oklch(0.7 0.15 250)",
  rejected: "oklch(0.6 0.2 15)",
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([])
  const [summary, setSummary] = useState<RecommendationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [recsRes, summaryRes] = await Promise.all([
          fetch("http://localhost:8001/prof/recommendations"),
          fetch("http://localhost:8001/prof/recommendations/summary"),
        ])
        
        if (recsRes.ok) setRecommendations(await recsRes.json())
        if (summaryRes.ok) setSummary(await summaryRes.json())
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const recColumns: Column<ResourceRecommendation>[] = [
    { key: "recommendation_id", label: "ID", render: (row) => <span className="font-mono text-xs">{row.recommendation_id}</span> },
    { key: "district_name", label: "District" },
    { key: "resource_type", label: "Resource", render: (row) => (
      <span className="capitalize">{row.resource_type.replace("_", " ")}</span>
    )},
    { key: "action", label: "Action", render: (row) => (
      <span className="font-medium capitalize">{row.action}</span>
    )},
    { key: "quantity", label: "Qty", render: (row) => `${row.quantity} ${row.unit}` },
    { key: "priority", label: "Priority", render: (row) => (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
        style={{ 
          backgroundColor: `${priorityColors[row.priority] || "oklch(0.5 0 0)"}20`,
          color: priorityColors[row.priority] || "oklch(0.5 0 0)"
        }}
      >
        {row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
      </span>
    )},
    { key: "estimated_impact", label: "Impact", render: (row) => `${row.estimated_impact}%` },
    { key: "estimated_cost", label: "Cost", render: (row) => `₹${(row.estimated_cost / 100000).toFixed(1)}L` },
    { key: "status", label: "Status", render: (row) => (
      <StatusBadge status={row.status === "approved" || row.status === "implemented" ? "low" : row.status === "pending" ? "medium" : "high"} />
    )},
  ]

  const priorityData = summary?.by_priority
    ? Object.entries(summary.by_priority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: priorityColors[name] || "oklch(0.5 0 0)",
      }))
    : []

  const resourceData = summary?.by_resource_type
    ? Object.entries(summary.by_resource_type).map(([name, value]) => ({
        name: name.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        value,
      }))
    : []

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Automated Recommendations" description="AI-generated resource allocation suggestions" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading recommendations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Automated Recommendations" description="AI-generated resource allocation suggestions" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Recommendations"
            value={summary?.total.toString() || "0"}
            icon={Lightbulb}
          />
          <MetricCard
            title="Pending Approval"
            value={(summary?.by_status?.pending || 0).toString()}
            icon={Clock}
          />
          <MetricCard
            title="Implemented"
            value={(summary?.by_status?.implemented || 0).toString()}
            icon={CheckCircle}
          />
          <MetricCard
            title="Avg Impact"
            value={`${(summary?.avg_estimated_impact || 0).toFixed(1)}%`}
            icon={AlertCircle}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Recommendations by Priority">
            <div className="h-[240px] flex items-center justify-center relative">
              {priorityData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {priorityData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">{summary?.total || 0}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="By Resource Type">
            {resourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={resourceData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="oklch(0.6 0.15 250)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">No resource data</div>
            )}
          </ChartCard>
        </div>

        {/* Cost Summary Card */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Total Estimated Cost">
            <div className="flex flex-col items-center justify-center h-32">
              <span className="text-4xl font-bold">₹{((summary?.total_estimated_cost || 0) / 10000000).toFixed(2)} Cr</span>
              <span className="text-muted-foreground text-sm mt-2">For all recommendations</span>
            </div>
          </ChartCard>

          <ChartCard title="Status Breakdown" className="lg:col-span-2">
            <div className="grid grid-cols-4 gap-4 h-32">
              {summary?.by_status && Object.entries(summary.by_status).map(([status, count]) => (
                <div key={status} className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: statusColors[status] }}>{count}</span>
                  <span className="text-xs text-muted-foreground capitalize mt-1">{status}</span>
                </div>
              ))}
              {(!summary?.by_status || Object.keys(summary.by_status).length === 0) && (
                <div className="col-span-4 flex items-center justify-center text-muted-foreground">No status data</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Recommendations Table */}
        <ChartCard title="All Recommendations">
          {recommendations.length > 0 ? (
            <DataTable columns={recColumns} data={recommendations} />
          ) : (
            <div className="text-center text-muted-foreground py-8">No recommendations available. Integrate your dataset to see AI-generated suggestions.</div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
