"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ChartCard } from "@/components/chart-card"
import { DataTable, Column } from "@/components/data-table"
import { MetricCard } from "@/components/metric-card"
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Hash } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface AuditLogEntry {
  entry_id: string
  timestamp: string
  action: string
  actor: string
  target_uid: string | null
  details: string
  hash: string
  previous_hash: string
}

interface VerificationResult {
  is_valid: boolean
  total_entries: number
  verified_entries: number
  broken_chain_at: string | null
  verification_time: string
}

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    async function fetchAuditLog() {
      try {
        const response = await fetch("http://localhost:8000/afif/audit-log")
        if (response.ok) {
          setAuditLog(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch audit log:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLog()
    const interval = setInterval(fetchAuditLog, 30000)
    return () => clearInterval(interval)
  }, [])

  const verifyChain = async () => {
    setVerifying(true)
    try {
      const response = await fetch("http://localhost:8000/afif/audit-log/verify")
      if (response.ok) {
        setVerification(await response.json())
      }
    } catch (error) {
      console.error("Failed to verify audit log:", error)
    } finally {
      setVerifying(false)
    }
  }

  const auditColumns: Column<AuditLogEntry>[] = [
    { key: "entry_id", label: "Entry ID", render: (row) => (
      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{row.entry_id.slice(0, 8)}...</span>
    )},
    { key: "timestamp", label: "Timestamp", render: (row) => (
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs">{new Date(row.timestamp).toLocaleString()}</span>
      </div>
    )},
    { key: "action", label: "Action", render: (row) => (
      <span className={`text-xs font-medium px-2 py-1 rounded ${
        row.action.includes("flag") ? "bg-destructive/10 text-destructive" :
        row.action.includes("create") ? "bg-success/10 text-success" :
        row.action.includes("update") ? "bg-warning/10 text-warning" :
        "bg-muted text-foreground"
      }`}>
        {row.action}
      </span>
    )},
    { key: "actor", label: "Actor" },
    { key: "target_uid", label: "Target UID", render: (row) => (
      row.target_uid ? (
        <span className="font-mono text-xs">{row.target_uid}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    )},
    { key: "details", label: "Details", render: (row) => (
      <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{row.details}</span>
    )},
    { key: "hash", label: "Hash", render: (row) => (
      <div className="flex items-center gap-1">
        <Hash className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">{row.hash.slice(0, 12)}...</span>
      </div>
    )},
  ]

  const actionCounts = auditLog.reduce((acc, entry) => {
    const action = entry.action.split("_")[0]
    acc[action] = (acc[action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const actorCounts = auditLog.reduce((acc, entry) => {
    acc[entry.actor] = (acc[entry.actor] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Time series data for chart
  const timeSeriesData = auditLog
    .slice(-20)
    .map((entry, index) => ({
      time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      entries: index + 1,
    }))

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Audit Trail" description="Tamper-evident audit log with cryptographic verification" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading audit log...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Audit Trail" description="Tamper-evident audit log with cryptographic verification" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Entries"
            value={auditLog.length.toString()}
            icon={FileText}
            change={{ value: Object.keys(actionCounts).length, label: "action types" }}
          />
          <MetricCard
            title="Chain Status"
            value={verification?.is_valid ? "Verified" : "Unverified"}
            icon={Shield}
            change={{ value: verification?.verified_entries || 0, label: "verified" }}
          />
          <MetricCard
            title="Unique Actors"
            value={Object.keys(actorCounts).length.toString()}
            icon={CheckCircle}
            change={{ value: auditLog.filter(e => e.target_uid).length, label: "with targets" }}
          />
          <MetricCard
            title="Flag Actions"
            value={auditLog.filter(e => e.action.includes("flag")).length.toString()}
            icon={AlertTriangle}
            change={{ value: auditLog.filter(e => e.action.includes("alert")).length, label: "alerts" }}
          />
        </div>

        {/* Verification Section */}
        <ChartCard title="Chain Verification">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={verifyChain}
              disabled={verifying}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Verify Chain Integrity"}
            </button>
            {verification && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                verification.is_valid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {verification.is_valid ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Chain is valid - {verification.verified_entries} entries verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Chain broken at entry: {verification.broken_chain_at}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Tamper-Evident</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each entry contains a cryptographic hash of the previous entry, creating an immutable chain.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">SHA-256 Hashing</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Industry-standard cryptographic hashing ensures data integrity and prevents unauthorized modifications.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Instant Verification</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time chain verification detects any tampering attempts immediately.
              </p>
            </div>
          </div>
        </ChartCard>

        {/* Activity Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Audit Activity Timeline">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(0.17 0.01 260)", border: "1px solid oklch(0.28 0.01 260)", borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="entries" stroke="oklch(0.65 0.2 265)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Action Breakdown">
            <div className="space-y-2">
              {Object.entries(actionCounts).map(([action, count]) => (
                <div key={action} className="flex items-center gap-3">
                  <span className="text-sm w-24 capitalize">{action}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / auditLog.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Actor Activity */}
        <ChartCard title="Actor Activity">
          <div className="grid gap-2 md:grid-cols-4">
            {Object.entries(actorCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([actor, count]) => (
                <div key={actor} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{actor}</span>
                    <span className="text-xs text-muted-foreground">{count} actions</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / Math.max(...Object.values(actorCounts))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </ChartCard>

        {/* Audit Log Table */}
        <ChartCard title="Audit Log Entries">
          <DataTable columns={auditColumns} data={auditLog} />
        </ChartCard>
      </div>
    </div>
  )
}
