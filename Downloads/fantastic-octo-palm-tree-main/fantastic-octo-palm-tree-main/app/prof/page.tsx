"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { MapPin, TrendingUp, Users, Building2, Activity, Target, CheckCircle, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

interface DashboardStats {
  migration_pressure: {
    total_districts: number
    pressure_breakdown: Record<string, number>
    avg_pressure_index: number
    top_stressed: any[]
    total_migration_inflow: number
    total_migration_outflow: number
  }
  demand_forecasting: {
    total_forecasts: number
    by_category: Record<string, { count: number; avg_growth_rate: number }>
    high_growth_areas: any[]
    avg_confidence: number
  }
  recommendations: {
    total_recommendations: number
    by_status: Record<string, number>
    by_priority: Record<string, number>
    by_resource_type: Record<string, number>
    total_estimated_cost: number
    pending_count: number
  }
  policy_effectiveness: {
    total_policies: number
    by_status: Record<string, number>
    avg_effectiveness: number
    total_budget: number
    successful_policies: number
    failed_policies: number
  }
  last_updated: string
}

const pressureColors = {
  low: "oklch(0.7 0.15 145)",
  moderate: "oklch(0.75 0.18 85)",
  high: "oklch(0.65 0.22 25)",
  critical: "oklch(0.6 0.22 15)",
}

export default function PROFDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8001/prof/dashboard")
        if (response.ok) {
          setStats(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch PROF dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="PROF Dashboard" description="Public Resource Optimization Framework" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const pressureData = stats?.migration_pressure.pressure_breakdown
    ? Object.entries(stats.migration_pressure.pressure_breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: pressureColors[name as keyof typeof pressureColors] || "oklch(0.5 0 0)",
      }))
    : []

  const categoryData = stats?.demand_forecasting.by_category
    ? Object.entries(stats.demand_forecasting.by_category).map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count: data.count,
        growth: data.avg_growth_rate,
      }))
    : []

  const priorityData = stats?.recommendations.by_priority
    ? Object.entries(stats.recommendations.by_priority).map(([priority, count]) => ({
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        count,
      }))
    : []

  return (
    <div className="flex flex-col">
      <Header title="PROF Dashboard" description="Public Resource Optimization Framework - Policy Analytics" />

      <div className="flex-1 space-y-6 p-6">
        {/* Main Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Districts"
            value={stats?.migration_pressure.total_districts.toString() || "0"}
            icon={MapPin}
            change={{ value: stats?.migration_pressure.top_stressed.length || 0, label: "stressed" }}
          />
          <MetricCard
            title="Demand Forecasts"
            value={stats?.demand_forecasting.total_forecasts.toString() || "0"}
            icon={TrendingUp}
            change={{ value: stats?.demand_forecasting.high_growth_areas.length || 0, label: "high growth" }}
          />
          <MetricCard
            title="Recommendations"
            value={stats?.recommendations.total_recommendations.toString() || "0"}
            icon={Target}
            change={{ value: stats?.recommendations.pending_count || 0, label: "pending" }}
          />
          <MetricCard
            title="Policy Actions"
            value={stats?.policy_effectiveness.total_policies.toString() || "0"}
            icon={CheckCircle}
            change={{ value: stats?.policy_effectiveness.successful_policies || 0, label: "successful" }}
          />
        </div>

        {/* Migration & Demand Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Migration Pressure Distribution" href="/prof/migration">
            <div className="h-[240px] flex items-center justify-center relative">
              {pressureData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pressureData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pressureData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">{stats?.migration_pressure.total_districts || 0}</span>
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

          <ChartCard title="Demand by Category" href="/prof/forecasts">
            <div className="h-[280px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="oklch(0.65 0.2 265)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Recommendations & Policy */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Recommendations by Priority" href="/prof/recommendations">
            <div className="space-y-3">
              {priorityData.length > 0 ? (
                priorityData.map((item) => (
                  <div key={item.priority} className="flex items-center gap-3">
                    <span className="text-sm w-20">{item.priority}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.count / Math.max(...priorityData.map(p => p.count), 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">No recommendations</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Policy Effectiveness" href="/prof/policies" className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <p className="text-3xl font-bold text-success">{stats?.policy_effectiveness.successful_policies || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Successful</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 text-center">
                <p className="text-3xl font-bold text-warning">
                  {(stats?.policy_effectiveness.total_policies || 0) - 
                   (stats?.policy_effectiveness.successful_policies || 0) - 
                   (stats?.policy_effectiveness.failed_policies || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">In Progress</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 text-center">
                <p className="text-3xl font-bold text-destructive">{stats?.policy_effectiveness.failed_policies || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Failed</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Effectiveness</span>
                <span className="text-lg font-bold">{(stats?.policy_effectiveness.avg_effectiveness || 0).toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${stats?.policy_effectiveness.avg_effectiveness || 0}%` }}
                />
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Migration Inflow</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{(stats?.migration_pressure.total_migration_inflow || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">total inflow</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Migration Outflow</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{(stats?.migration_pressure.total_migration_outflow || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">total outflow</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Avg Confidence</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{(stats?.demand_forecasting.avg_confidence || 0).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">forecast accuracy</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium">Est. Cost</span>
            </div>
            <p className="mt-2 text-2xl font-bold">₹{((stats?.recommendations.total_estimated_cost || 0) / 10000000).toFixed(1)}Cr</p>
            <p className="text-xs text-muted-foreground">recommendations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
