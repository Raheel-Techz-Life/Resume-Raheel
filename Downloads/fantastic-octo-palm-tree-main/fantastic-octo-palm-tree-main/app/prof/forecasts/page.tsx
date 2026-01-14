"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { TrendingUp, Calendar, Target, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"

interface DemandForecast {
  forecast_id: string
  district_id: string
  district_name: string
  category: string
  current_demand: number
  predicted_demand: number
  change_pct: number
  confidence: number
  trend: string
  horizon_days: number
  forecast_date: string
}

interface DemandSummary {
  total_forecasts: number
  by_category: Record<string, number>
  avg_change_pct: number
  avg_confidence: number
  trend_breakdown: Record<string, number>
}

const categoryColors: Record<string, string> = {
  health: "oklch(0.6 0.2 15)",
  ration: "oklch(0.65 0.2 145)",
  education: "oklch(0.7 0.18 250)",
  banking: "oklch(0.7 0.18 45)",
  employment: "oklch(0.65 0.2 300)",
}

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [summary, setSummary] = useState<DemandSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [forecastsRes, summaryRes] = await Promise.all([
          fetch("http://localhost:8001/prof/forecasts"),
          fetch("http://localhost:8001/prof/forecasts/summary"),
        ])
        
        if (forecastsRes.ok) setForecasts(await forecastsRes.json())
        if (summaryRes.ok) setSummary(await summaryRes.json())
      } catch (error) {
        console.error("Failed to fetch forecast data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const forecastColumns: Column<DemandForecast>[] = [
    { key: "forecast_id", label: "ID", render: (row) => <span className="font-mono text-xs">{row.forecast_id}</span> },
    { key: "district_name", label: "District" },
    { key: "category", label: "Category", render: (row) => (
      <span 
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
        style={{ 
          backgroundColor: `${categoryColors[row.category] || "oklch(0.5 0 0)"}20`,
          color: categoryColors[row.category] || "oklch(0.5 0 0)"
        }}
      >
        {row.category.charAt(0).toUpperCase() + row.category.slice(1)}
      </span>
    )},
    { key: "current_demand", label: "Current", render: (row) => row.current_demand.toLocaleString() },
    { key: "predicted_demand", label: "Predicted", render: (row) => row.predicted_demand.toLocaleString() },
    { key: "change_pct", label: "Change", render: (row) => (
      <span className={row.change_pct >= 0 ? "text-destructive" : "text-success"}>
        {row.change_pct >= 0 ? "+" : ""}{row.change_pct.toFixed(1)}%
      </span>
    )},
    { key: "confidence", label: "Confidence", render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${row.confidence}%` }} />
        </div>
        <span className="text-xs">{row.confidence}%</span>
      </div>
    )},
    { key: "trend", label: "Trend", render: (row) => (
      <StatusBadge status={row.trend === "increasing" ? "critical" : row.trend === "stable" ? "medium" : "low"} />
    )},
    { key: "horizon_days", label: "Horizon", render: (row) => `${row.horizon_days}d` },
  ]

  const categoryData = summary?.by_category
    ? Object.entries(summary.by_category).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: categoryColors[name] || "oklch(0.5 0 0)",
      }))
    : []

  const trendData = summary?.trend_breakdown
    ? Object.entries(summary.trend_breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : []

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Predictive Demand Forecasting" description="AI-powered demand prediction for public resources" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading forecasts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Predictive Demand Forecasting" description="AI-powered demand prediction for public resources" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Forecasts"
            value={summary?.total_forecasts.toString() || "0"}
            icon={BarChart3}
          />
          <MetricCard
            title="Avg Change"
            value={`${(summary?.avg_change_pct || 0) >= 0 ? "+" : ""}${(summary?.avg_change_pct || 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Avg Confidence"
            value={`${(summary?.avg_confidence || 0).toFixed(1)}%`}
            icon={Target}
          />
          <MetricCard
            title="Categories"
            value={(categoryData.length).toString()}
            icon={Calendar}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Forecasts by Category">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">No category data</div>
            )}
          </ChartCard>

          <ChartCard title="Trend Distribution">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="oklch(0.6 0.15 250)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">No trend data</div>
            )}
          </ChartCard>
        </div>

        {/* Forecasts Table */}
        <ChartCard title="All Demand Forecasts">
          {forecasts.length > 0 ? (
            <DataTable columns={forecastColumns} data={forecasts} />
          ) : (
            <div className="text-center text-muted-foreground py-8">No forecast data available. Integrate your dataset to see demand predictions.</div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

// Cell import for recharts
import { Cell } from "recharts"
