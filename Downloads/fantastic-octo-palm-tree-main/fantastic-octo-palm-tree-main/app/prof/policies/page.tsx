"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { FileText, PlayCircle, CheckCircle2, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts"

interface PolicyAction {
  policy_id: string
  title: string
  description: string
  department: string
  target_districts: string[]
  start_date: string
  end_date: string
  status: string
  budget_allocated: number
  budget_utilized: number
  expected_outcome: string
  actual_outcome: string
  effectiveness_score: number
  feedback_count: number
}

interface EffectivenessSummary {
  total_policies: number
  active_policies: number
  completed_policies: number
  avg_effectiveness: number
  total_budget_allocated: number
  total_budget_utilized: number
  by_department: Record<string, number>
  effectiveness_distribution: Record<string, number>
}

const statusColors: Record<string, string> = {
  draft: "oklch(0.6 0 0)",
  active: "oklch(0.65 0.18 145)",
  completed: "oklch(0.7 0.15 250)",
  suspended: "oklch(0.65 0.22 25)",
}

const effectivenessColors: Record<string, string> = {
  excellent: "oklch(0.65 0.18 145)",
  good: "oklch(0.7 0.15 200)",
  moderate: "oklch(0.75 0.18 85)",
  poor: "oklch(0.65 0.22 25)",
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyAction[]>([])
  const [summary, setSummary] = useState<EffectivenessSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [policiesRes, summaryRes] = await Promise.all([
          fetch("http://localhost:8001/prof/policies"),
          fetch("http://localhost:8001/prof/policies/effectiveness"),
        ])
        
        if (policiesRes.ok) setPolicies(await policiesRes.json())
        if (summaryRes.ok) setSummary(await summaryRes.json())
      } catch (error) {
        console.error("Failed to fetch policies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const policyColumns: Column<PolicyAction>[] = [
    { key: "policy_id", label: "ID", render: (row) => <span className="font-mono text-xs">{row.policy_id}</span> },
    { key: "title", label: "Policy", render: (row) => (
      <div>
        <div className="font-medium">{row.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">{row.description}</div>
      </div>
    )},
    { key: "department", label: "Dept" },
    { key: "target_districts", label: "Districts", render: (row) => `${row.target_districts.length} districts` },
    { key: "budget_allocated", label: "Budget", render: (row) => `₹${(row.budget_allocated / 10000000).toFixed(1)} Cr` },
    { key: "budget_utilized", label: "Utilized", render: (row) => {
      const pct = row.budget_allocated > 0 ? (row.budget_utilized / row.budget_allocated * 100) : 0
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs">{pct.toFixed(0)}%</span>
        </div>
      )
    }},
    { key: "effectiveness_score", label: "Score", render: (row) => (
      <span className={`font-medium ${row.effectiveness_score >= 75 ? "text-success" : row.effectiveness_score >= 50 ? "text-warning" : "text-destructive"}`}>
        {row.effectiveness_score}%
      </span>
    )},
    { key: "status", label: "Status", render: (row) => (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize"
        style={{ 
          backgroundColor: `${statusColors[row.status] || "oklch(0.5 0 0)"}20`,
          color: statusColors[row.status] || "oklch(0.5 0 0)"
        }}
      >
        {row.status}
      </span>
    )},
    { key: "feedback_count", label: "Feedback", render: (row) => row.feedback_count },
  ]

  const departmentData = summary?.by_department
    ? Object.entries(summary.by_department).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  const effectivenessData = summary?.effectiveness_distribution
    ? Object.entries(summary.effectiveness_distribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: effectivenessColors[name] || "oklch(0.5 0 0)",
      }))
    : []

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Policy Actions & Outcomes" description="Track policy effectiveness and feedback loops" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading policies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Policy Actions & Outcomes" description="Track policy effectiveness and feedback loops" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Policies"
            value={summary?.total_policies.toString() || "0"}
            icon={FileText}
          />
          <MetricCard
            title="Active"
            value={(summary?.active_policies || 0).toString()}
            icon={PlayCircle}
          />
          <MetricCard
            title="Completed"
            value={(summary?.completed_policies || 0).toString()}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Avg Effectiveness"
            value={`${(summary?.avg_effectiveness || 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        {/* Budget Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Budget Allocated">
            <div className="flex flex-col items-center justify-center h-24">
              <span className="text-3xl font-bold">₹{((summary?.total_budget_allocated || 0) / 10000000).toFixed(1)} Cr</span>
              <span className="text-muted-foreground text-sm mt-1">Total allocation</span>
            </div>
          </ChartCard>
          <ChartCard title="Budget Utilized">
            <div className="flex flex-col items-center justify-center h-24">
              <span className="text-3xl font-bold">₹{((summary?.total_budget_utilized || 0) / 10000000).toFixed(1)} Cr</span>
              <span className="text-muted-foreground text-sm mt-1">
                {summary?.total_budget_allocated 
                  ? `${((summary.total_budget_utilized / summary.total_budget_allocated) * 100).toFixed(0)}% utilization`
                  : "No data"}
              </span>
            </div>
          </ChartCard>
          <ChartCard title="Utilization Rate">
            <div className="flex items-center justify-center h-24">
              {summary?.total_budget_allocated ? (
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="oklch(0.3 0 0)" strokeWidth="8" fill="none" />
                    <circle
                      cx="48" cy="48" r="40"
                      stroke="oklch(0.65 0.18 145)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(summary.total_budget_utilized / summary.total_budget_allocated) * 251.2} 251.2`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {((summary.total_budget_utilized / summary.total_budget_allocated) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No data</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Policies by Department">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={departmentData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="oklch(0.6 0.15 250)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground">No department data</div>
            )}
          </ChartCard>

          <ChartCard title="Effectiveness Distribution">
            <div className="h-[240px] flex items-center justify-center relative">
              {effectivenessData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={effectivenessData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {effectivenessData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">{summary?.total_policies || 0}</span>
                    <span className="text-xs text-muted-foreground">Policies</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {effectivenessData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Policies Table */}
        <ChartCard title="All Policy Actions">
          {policies.length > 0 ? (
            <DataTable columns={policyColumns} data={policies} />
          ) : (
            <div className="text-center text-muted-foreground py-8">No policy data available. Integrate your dataset to see policy actions and outcomes.</div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
