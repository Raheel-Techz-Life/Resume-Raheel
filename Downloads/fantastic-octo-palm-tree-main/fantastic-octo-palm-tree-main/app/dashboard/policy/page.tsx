"use client"

import { Header } from "@/components/header"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { FileText, Building, Users, TrendingUp, Lightbulb } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const regionalStats = [
  { state: "Maharashtra", population: 12.4, coverage: 98.2, services: 847 },
  { state: "Uttar Pradesh", population: 20.1, coverage: 94.8, services: 1024 },
  { state: "Tamil Nadu", population: 7.8, coverage: 99.1, services: 632 },
  { state: "Karnataka", population: 6.4, coverage: 97.6, services: 589 },
  { state: "Gujarat", population: 6.2, coverage: 96.4, services: 478 },
  { state: "West Bengal", population: 9.1, coverage: 93.2, services: 567 },
]

const serviceDistribution = [
  { name: "Banking", value: 35, color: "oklch(0.65 0.2 265)" },
  { name: "Telecom", value: 28, color: "oklch(0.7 0.15 180)" },
  { name: "Government", value: 22, color: "oklch(0.75 0.18 85)" },
  { name: "Healthcare", value: 15, color: "oklch(0.65 0.2 330)" },
]

const demographicData = [
  { age: "18-25", male: 18, female: 16 },
  { age: "26-35", male: 24, female: 22 },
  { age: "36-45", male: 20, female: 19 },
  { age: "46-55", male: 14, female: 13 },
  { age: "56-65", male: 10, female: 9 },
  { age: "65+", male: 8, female: 7 },
]

const policyRecommendations = [
  {
    id: 1,
    title: "Expand Rural Coverage",
    description: "Coverage gap identified in rural districts of Bihar and Jharkhand",
    impact: "High",
    status: "proposed",
    affectedPop: "2.4M",
  },
  {
    id: 2,
    title: "Update Verification Protocols",
    description: "Biometric verification failure rate above threshold in humid regions",
    impact: "Medium",
    status: "approved",
    affectedPop: "850K",
  },
  {
    id: 3,
    title: "Cross-State Data Sharing",
    description: "Enable seamless identity verification across state boundaries",
    impact: "High",
    status: "implementing",
    affectedPop: "5.2M",
  },
]

const statsColumns = [
  { key: "state", label: "State" },
  {
    key: "population",
    label: "Population (M)",
    render: (item: (typeof regionalStats)[0]) => `${item.population}M`,
  },
  {
    key: "coverage",
    label: "Coverage",
    render: (item: (typeof regionalStats)[0]) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-16 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${item.coverage}%` }} />
        </div>
        <span className="text-sm">{item.coverage}%</span>
      </div>
    ),
  },
  {
    key: "services",
    label: "Active Services",
    render: (item: (typeof regionalStats)[0]) => item.services.toLocaleString(),
  },
]

export default function PolicyPage() {
  return (
    <div className="flex flex-col">
      <Header title="Policy Insights" description="PROF - Policy & Regional Operations Framework" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Policies"
            value="147"
            change={{ value: 8, label: "new this quarter" }}
            icon={FileText}
          />
          <MetricCard title="States Covered" value="36" change={{ value: 2, label: "UTs included" }} icon={Building} />
          <MetricCard
            title="Population Reached"
            value="1.38B"
            change={{ value: 2.4, label: "growth YoY" }}
            icon={Users}
          />
          <MetricCard
            title="Service Adoptions"
            value="4,287"
            change={{ value: 18.2, label: "vs last year" }}
            icon={TrendingUp}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard
            title="Demographic Distribution"
            className="lg:col-span-2"
            legend={[
              { label: "Male", color: "oklch(0.65 0.2 265)" },
              { label: "Female", color: "oklch(0.65 0.2 330)" },
            ]}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="age"
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
                  <Bar dataKey="male" fill="oklch(0.65 0.2 265)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="female" fill="oklch(0.65 0.2 330)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Service Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0.01 260)",
                        border: "1px solid oklch(0.28 0.01 260)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {serviceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Recommendations */}
        <ChartCard title="Policy Recommendations">
          <div className="grid gap-4 md:grid-cols-3">
            {policyRecommendations.map((rec) => (
              <Card key={rec.id} className="bg-secondary">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <StatusBadge
                      status={
                        rec.status === "implementing" ? "success" : rec.status === "approved" ? "info" : "warning"
                      }
                      label={rec.status}
                    />
                  </div>
                  <CardTitle className="text-sm font-medium">{rec.title}</CardTitle>
                  <CardDescription className="text-xs">{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Impact: {rec.impact}</span>
                    <span className="font-medium text-foreground">{rec.affectedPop} affected</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ChartCard>

        {/* Regional Statistics Table */}
        <ChartCard title="Regional Statistics">
          <DataTable columns={statsColumns} data={regionalStats} />
        </ChartCard>
      </div>
    </div>
  )
}
