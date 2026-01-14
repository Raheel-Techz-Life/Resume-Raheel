"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { FileSearch, Clock, CheckCircle, AlertTriangle, XCircle, User } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface InvestigationCase {
  case_id: string
  title: string
  description: string
  status: "open" | "investigating" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  assigned_to: string
  created_at: string
  updated_at: string
  related_uids: string[]
  findings: string[]
}

const priorityColors = {
  low: "oklch(0.7 0.15 145)",
  medium: "oklch(0.75 0.18 85)",
  high: "oklch(0.65 0.22 25)",
  critical: "oklch(0.6 0.22 15)",
}

const statusIcons: Record<string, typeof Clock> = {
  open: Clock,
  investigating: FileSearch,
  resolved: CheckCircle,
  closed: XCircle,
}

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([])
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "open" | "investigating" | "resolved" | "closed">("all")

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch("http://localhost:8000/afif/cases")
        if (response.ok) {
          setCases(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch cases:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
    const interval = setInterval(fetchCases, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCaseDetail = async (caseId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/afif/cases/${caseId}`)
      if (response.ok) {
        setSelectedCase(await response.json())
      }
    } catch (error) {
      console.error("Failed to fetch case detail:", error)
    }
  }

  const caseColumns: Column<InvestigationCase>[] = [
    { key: "case_id", label: "Case ID", render: (row) => (
      <button
        onClick={() => fetchCaseDetail(row.case_id)}
        className="font-mono text-xs bg-muted px-2 py-1 rounded hover:bg-primary/20 transition-colors"
      >
        {row.case_id}
      </button>
    )},
    { key: "title", label: "Title", render: (row) => (
      <span className="font-medium max-w-[200px] truncate block">{row.title}</span>
    )},
    { key: "status", label: "Status", render: (row) => {
      const Icon = statusIcons[row.status]
      return (
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          <span className="capitalize">{row.status}</span>
        </div>
      )
    }},
    { key: "priority", label: "Priority", render: (row) => <StatusBadge status={row.priority} /> },
    { key: "assigned_to", label: "Assigned To", render: (row) => (
      <div className="flex items-center gap-1.5">
        <User className="h-3 w-3 text-muted-foreground" />
        <span>{row.assigned_to}</span>
      </div>
    )},
    { key: "related_uids", label: "Related UIDs", render: (row) => (
      <span className="text-muted-foreground">{row.related_uids.length} identities</span>
    )},
    { key: "updated_at", label: "Updated", render: (row) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.updated_at).toLocaleDateString()}
      </span>
    )},
  ]

  const filteredCases = filter === "all" ? cases : cases.filter(c => c.status === filter)

  const statusDistribution = [
    { name: "Open", value: cases.filter(c => c.status === "open").length, color: "oklch(0.75 0.18 85)" },
    { name: "Investigating", value: cases.filter(c => c.status === "investigating").length, color: "oklch(0.65 0.2 265)" },
    { name: "Resolved", value: cases.filter(c => c.status === "resolved").length, color: "oklch(0.7 0.15 145)" },
    { name: "Closed", value: cases.filter(c => c.status === "closed").length, color: "oklch(0.5 0 0)" },
  ]

  const priorityDistribution = [
    { name: "Low", value: cases.filter(c => c.priority === "low").length, color: priorityColors.low },
    { name: "Medium", value: cases.filter(c => c.priority === "medium").length, color: priorityColors.medium },
    { name: "High", value: cases.filter(c => c.priority === "high").length, color: priorityColors.high },
    { name: "Critical", value: cases.filter(c => c.priority === "critical").length, color: priorityColors.critical },
  ]

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Investigation Cases" description="Track and manage fraud investigation cases" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading cases...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Investigation Cases" description="Track and manage fraud investigation cases" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Cases"
            value={cases.length.toString()}
            icon={FileSearch}
            change={{ value: cases.filter(c => c.status === "open").length, label: "open" }}
          />
          <MetricCard
            title="Active Investigations"
            value={cases.filter(c => c.status === "investigating").length.toString()}
            icon={Clock}
            change={{ value: cases.filter(c => c.priority === "critical" && c.status === "investigating").length, label: "critical" }}
          />
          <MetricCard
            title="Resolved"
            value={cases.filter(c => c.status === "resolved").length.toString()}
            icon={CheckCircle}
            change={{ value: cases.filter(c => c.status === "closed").length, label: "closed" }}
          />
          <MetricCard
            title="High Priority"
            value={cases.filter(c => c.priority === "high" || c.priority === "critical").length.toString()}
            icon={AlertTriangle}
            change={{ value: cases.filter(c => c.priority === "critical").length, label: "critical" }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Status Distribution">
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold">{cases.length}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Priority Distribution">
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold">{cases.filter(c => c.priority === "high" || c.priority === "critical").length}</span>
                <span className="text-xs text-muted-foreground">High+</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {priorityDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedCase.case_id}</span>
                  <StatusBadge status={selectedCase.priority} />
                </div>
                <h3 className="text-lg font-semibold mt-2">{selectedCase.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{selectedCase.description}</p>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="capitalize font-medium">{selectedCase.status}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Assigned To</span>
                <p className="font-medium">{selectedCase.assigned_to}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="font-medium">{new Date(selectedCase.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedCase.related_uids.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground">Related UIDs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCase.related_uids.map((uid, i) => (
                    <span key={i} className="font-mono text-xs bg-muted px-2 py-1 rounded">{uid}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedCase.findings.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Findings:</span>
                <ul className="mt-1 space-y-1">
                  {selectedCase.findings.map((finding, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: "all", label: `All (${cases.length})` },
            { key: "open", label: `Open (${cases.filter(c => c.status === "open").length})` },
            { key: "investigating", label: `Investigating (${cases.filter(c => c.status === "investigating").length})` },
            { key: "resolved", label: `Resolved (${cases.filter(c => c.status === "resolved").length})` },
            { key: "closed", label: `Closed (${cases.filter(c => c.status === "closed").length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cases Table */}
        <ChartCard title="Investigation Cases">
          <DataTable columns={caseColumns} data={filteredCases} />
        </ChartCard>
      </div>
    </div>
  )
}
