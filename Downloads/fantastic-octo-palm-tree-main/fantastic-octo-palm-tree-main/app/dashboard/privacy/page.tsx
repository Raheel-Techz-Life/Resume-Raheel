"use client"

import { Header } from "@/components/header"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Shield, Lock, Eye, FileCheck, Database, Clock } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const privacyBudget = [
  { day: "Mon", used: 12, remaining: 88 },
  { day: "Tue", used: 18, remaining: 82 },
  { day: "Wed", used: 25, remaining: 75 },
  { day: "Thu", used: 31, remaining: 69 },
  { day: "Fri", used: 38, remaining: 62 },
  { day: "Sat", used: 42, remaining: 58 },
  { day: "Sun", used: 45, remaining: 55 },
]

const auditLog = [
  {
    id: "QRY-8847",
    query: "Regional demographic aggregation",
    epsilon: 0.5,
    timestamp: "10 min ago",
    user: "analyst_01",
    status: "completed",
  },
  {
    id: "QRY-8846",
    query: "Migration pattern analysis",
    epsilon: 0.8,
    timestamp: "25 min ago",
    user: "researcher_03",
    status: "completed",
  },
  {
    id: "QRY-8845",
    query: "Service usage statistics",
    epsilon: 0.3,
    timestamp: "1 hr ago",
    user: "policy_team",
    status: "completed",
  },
  {
    id: "QRY-8844",
    query: "Cross-state identity check",
    epsilon: 1.2,
    timestamp: "2 hr ago",
    user: "security_ops",
    status: "denied",
  },
  {
    id: "QRY-8843",
    query: "Age distribution report",
    epsilon: 0.4,
    timestamp: "3 hr ago",
    user: "analytics_team",
    status: "completed",
  },
]

const complianceChecks = [
  { name: "Data Minimization", status: "pass", score: 100 },
  { name: "Purpose Limitation", status: "pass", score: 98 },
  { name: "Consent Verification", status: "pass", score: 100 },
  { name: "Access Controls", status: "pass", score: 97 },
  { name: "Encryption Standards", status: "pass", score: 100 },
  { name: "Retention Policies", status: "warning", score: 89 },
]

const auditColumns = [
  { key: "id", label: "Query ID", className: "font-mono text-sm" },
  { key: "query", label: "Query Description" },
  {
    key: "epsilon",
    label: "Epsilon (ε)",
    render: (item: (typeof auditLog)[0]) => (
      <span className={item.epsilon > 1 ? "text-destructive" : "text-foreground"}>{item.epsilon}</span>
    ),
  },
  { key: "user", label: "User", className: "text-muted-foreground" },
  {
    key: "status",
    label: "Status",
    render: (item: (typeof auditLog)[0]) => (
      <StatusBadge status={item.status === "completed" ? "success" : "error"} label={item.status} />
    ),
  },
  { key: "timestamp", label: "Time", className: "text-muted-foreground" },
]

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <Header title="Privacy Framework" description="PPAF - Privacy Preserving Analytics Framework" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Privacy Score" value="98.2%" change={{ value: 0.5, label: "compliance" }} icon={Shield} />
          <MetricCard title="Budget Remaining" value="55%" change={{ value: -12, label: "this week" }} icon={Lock} />
          <MetricCard title="Queries Today" value="847" change={{ value: 12.3, label: "vs yesterday" }} icon={Eye} />
          <MetricCard title="Compliance Checks" value="6/6" change={{ value: 100, label: "passed" }} icon={FileCheck} />
        </div>

        {/* Charts & Compliance Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard
            title="Privacy Budget Usage (Weekly)"
            className="lg:col-span-2"
            legend={[
              { label: "Used", color: "oklch(0.65 0.2 265)" },
              { label: "Remaining", color: "oklch(0.7 0.15 145)" },
            ]}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={privacyBudget} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.01 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="used"
                    stroke="oklch(0.65 0.2 265)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.65 0.2 265)", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="remaining"
                    stroke="oklch(0.7 0.15 145)"
                    strokeWidth={2}
                    dot={{ fill: "oklch(0.7 0.15 145)", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceChecks.map((check) => (
                <div key={check.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{check.name}</span>
                    <span className={check.status === "pass" ? "text-success" : "text-warning"}>{check.score}%</span>
                  </div>
                  <Progress value={check.score} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Differential Privacy Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Epsilon Used</p>
                <p className="text-2xl font-bold text-foreground">4.5 ε</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Budget Limit</p>
                <p className="text-2xl font-bold text-foreground">10.0 ε</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Reset In</p>
                <p className="text-2xl font-bold text-foreground">8h 24m</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Table */}
        <ChartCard title="Query Audit Log">
          <DataTable columns={auditColumns} data={auditLog} />
        </ChartCard>
      </div>
    </div>
  )
}
