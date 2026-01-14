"use client"

import { Header } from "@/components/header"
import { MetricCard } from "@/components/metric-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Route, TrendingUp, MapPin, Users } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const migrationTrends = [
  { month: "Jul", inbound: 45000, outbound: 32000 },
  { month: "Aug", inbound: 52000, outbound: 38000 },
  { month: "Sep", inbound: 48000, outbound: 41000 },
  { month: "Oct", inbound: 61000, outbound: 35000 },
  { month: "Nov", inbound: 58000, outbound: 42000 },
  { month: "Dec", inbound: 67000, outbound: 39000 },
]

const topCorridors = [
  {
    id: 1,
    from: "Bihar",
    to: "Maharashtra",
    volume: 128500,
    change: 12.4,
    pattern: "Economic",
  },
  {
    id: 2,
    from: "Uttar Pradesh",
    to: "Delhi NCR",
    volume: 98200,
    change: 8.7,
    pattern: "Employment",
  },
  {
    id: 3,
    from: "Rajasthan",
    to: "Gujarat",
    volume: 76400,
    change: -3.2,
    pattern: "Seasonal",
  },
  {
    id: 4,
    from: "Odisha",
    to: "Karnataka",
    volume: 54800,
    change: 15.1,
    pattern: "Education",
  },
  {
    id: 5,
    from: "West Bengal",
    to: "Tamil Nadu",
    volume: 42100,
    change: 6.8,
    pattern: "Economic",
  },
]

const patternDistribution = [
  { name: "Economic", value: 42, color: "oklch(0.65 0.2 265)" },
  { name: "Employment", value: 28, color: "oklch(0.7 0.15 180)" },
  { name: "Education", value: 18, color: "oklch(0.75 0.18 85)" },
  { name: "Seasonal", value: 12, color: "oklch(0.65 0.2 330)" },
]

const corridorColumns = [
  {
    key: "from",
    label: "Origin",
    render: (item: (typeof topCorridors)[0]) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {item.from}
      </div>
    ),
  },
  {
    key: "to",
    label: "Destination",
    render: (item: (typeof topCorridors)[0]) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        {item.to}
      </div>
    ),
  },
  {
    key: "volume",
    label: "Volume",
    render: (item: (typeof topCorridors)[0]) => item.volume.toLocaleString(),
  },
  {
    key: "change",
    label: "Change",
    render: (item: (typeof topCorridors)[0]) => (
      <span className={item.change >= 0 ? "text-success" : "text-destructive"}>
        {item.change >= 0 ? "+" : ""}
        {item.change}%
      </span>
    ),
  },
  {
    key: "pattern",
    label: "Pattern",
    render: (item: (typeof topCorridors)[0]) => <StatusBadge status="info" label={item.pattern} />,
  },
]

export default function MobilityPage() {
  return (
    <div className="flex flex-col">
      <Header title="Mobility Patterns" description="AMF - Anomaly & Migration Framework analysis" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Migrations"
            value="847K"
            change={{ value: 12.3, label: "this quarter" }}
            icon={Route}
          />
          <MetricCard
            title="Migration Corridors"
            value="1,247"
            change={{ value: 5.8, label: "vs last month" }}
            icon={TrendingUp}
          />
          <MetricCard title="Top Destination" value="Maharashtra" icon={MapPin} />
          <MetricCard
            title="Avg Mobility Score"
            value="72.4"
            change={{ value: 2.1, label: "improvement" }}
            icon={Users}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard
            title="Migration Trends (6 months)"
            className="lg:col-span-2"
            legend={[
              { label: "Inbound", color: "oklch(0.65 0.2 265)" },
              { label: "Outbound", color: "oklch(0.75 0.18 85)" },
            ]}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={migrationTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 265)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.2 265)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.18 85)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.75 0.18 85)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.17 0.01 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="oklch(0.65 0.2 265)"
                    strokeWidth={2}
                    fill="url(#inboundGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="oklch(0.75 0.18 85)"
                    strokeWidth={2}
                    fill="url(#outboundGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pattern Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patternDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {patternDistribution.map((entry, index) => (
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
                {patternDistribution.map((item) => (
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

        {/* Top Corridors Table */}
        <ChartCard title="Top Migration Corridors">
          <DataTable columns={corridorColumns} data={topCorridors} />
        </ChartCard>
      </div>
    </div>
  )
}
