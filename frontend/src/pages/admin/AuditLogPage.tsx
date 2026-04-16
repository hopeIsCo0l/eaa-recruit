import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminApi, type AuditLog } from '@/api/admin'

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [entityFilter, setEntityFilter] = useState('')
  const PAGE_SIZE = 20

  const load = (p: number, reset = false) => {
    setLoading(true)
    adminApi
      .getAuditLogs(p, PAGE_SIZE)
      .then((r) => {
        const data = r.data.data
        setLogs((prev) => (reset ? data : [...prev, ...data]))
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(0, true) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next)
  }

  const filtered = entityFilter
    ? logs.filter((l) => l.entityType.toLowerCase().includes(entityFilter.toLowerCase()))
    : logs

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Input
          placeholder="Filter by entity type…"
          className="w-64"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No audit entries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">When</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Transition</th>
                    <th className="p-3">By</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(log.changedAt)}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{log.entityType}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.entityId}</td>
                      <td className="p-3">
                        <span className="text-muted-foreground">{log.oldStatus ?? '—'}</span>
                        {' → '}
                        <span className="font-medium">{log.newStatus}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{log.changedByEmail ?? '—'}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{log.reason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
      {loading && logs.length > 0 && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
