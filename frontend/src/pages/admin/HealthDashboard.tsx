import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { adminApi, type SystemHealth } from '@/api/admin'

function StatusBadge({ up }: { up: boolean }) {
  return up ? (
    <Badge variant="success" className="flex items-center gap-1 w-fit">
      <CheckCircle2 className="h-3 w-3" /> Up
    </Badge>
  ) : (
    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
      <XCircle className="h-3 w-3" /> Down
    </Badge>
  )
}

export function HealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<{ jobTitle: string; total: number; selected: number }[]>([])

  const reload = () => {
    setLoading(true)
    Promise.all([
      adminApi.getSystemHealth(),
      adminApi.getAnalytics(),
    ])
      .then(([h, a]) => {
        setHealth(h.data.data)
        setAnalyticsData(
          a.data.data.jobs.map((j) => ({
            jobTitle: j.jobTitle.length > 20 ? j.jobTitle.slice(0, 20) + '…' : j.jobTitle,
            total: j.total,
            selected: j.selected,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    const interval = setInterval(reload, 30_000)
    return () => clearInterval(interval)
  }, [])

  const fmtUptime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health</h1>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {loading && !health ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : health ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Database</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatusBadge up={health.database.up} />
                <p className="text-xs text-muted-foreground">
                  Active: {health.database.activeConnections} · Idle: {health.database.idleConnections}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Redis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatusBadge up={health.redis.up} />
                <p className="text-xs text-muted-foreground line-clamp-2">{health.redis.info || '—'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Kafka</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatusBadge up={health.kafka.up} />
                <p className="text-xs text-muted-foreground">{health.kafka.details || '—'}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Uptime: {fmtUptime(health.uptimeSeconds)}</CardTitle>
            </CardHeader>
          </Card>

          {analyticsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applications by Job</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analyticsData} margin={{ top: 4, right: 8, bottom: 40, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="jobTitle"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="total" name="Total" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="selected" name="Selected" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-16">Unable to load health data.</p>
      )}
    </div>
  )
}
