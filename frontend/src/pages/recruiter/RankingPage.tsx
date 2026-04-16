import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { applicationsApi, type Application } from '@/api/applications'
import { jobsApi, type JobPosting } from '@/api/jobs'
import { XaiDrawer } from '@/components/recruiter/XaiDrawer'
import { BatchToolbar } from '@/components/recruiter/BatchToolbar'

type SortKey = 'finalScore' | 'cvRelevanceScore' | 'examScore' | 'status'
type SortDir = 'asc' | 'desc'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  SUBMITTED: 'secondary',
  AI_SCREENING: 'default',
  HARD_FILTER_FAILED: 'destructive',
  EXAM_AUTHORIZED: 'warning',
  EXAM_COMPLETED: 'default',
  SHORTLISTED: 'default',
  INTERVIEW_SCHEDULED: 'warning',
  SELECTED: 'success',
  REJECTED: 'destructive',
  WAITLISTED: 'secondary',
}

export function RankingPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('finalScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [xaiAppId, setXaiAppId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15

  useEffect(() => {
    jobsApi.list().then((r) => setJobs(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedJobId) return
    setLoading(true)
    setSelectedIds(new Set())
    applicationsApi
      .listByJob(selectedJobId)
      .then((r) => setApps(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedJobId])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...apps].sort((a, b) => {
    const av = (a[sortKey] as number | string | undefined) ?? ''
    const bv = (b[sortKey] as number | string | undefined) ?? ''
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const pageSlice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === pageSlice.length ? new Set() : new Set(pageSlice.map((a) => a.id))
    )

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'desc' ? <ChevronDown className="h-3 w-3 inline ml-1" /> : <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : null

  const reload = () => {
    if (!selectedJobId) return
    setLoading(true)
    applicationsApi.listByJob(selectedJobId).then((r) => setApps(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Candidate Rankings</h1>
        <select
          className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground"
          value={selectedJobId ?? ''}
          onChange={(e) => { setSelectedJobId(Number(e.target.value) || null); setPage(0) }}
        >
          <option value="">Select a job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <BatchToolbar
          selectedIds={[...selectedIds]}
          jobId={selectedJobId!}
          onDone={() => { setSelectedIds(new Set()); reload() }}
        />
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedJobId ? (
            <p className="text-muted-foreground text-center py-16">Select a job to view rankings.</p>
          ) : apps.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === pageSlice.length && pageSlice.length > 0}
                        onChange={toggleAll}
                        className="accent-primary"
                      />
                    </th>
                    <th className="p-3">#</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort('status')}>
                      Status <SortIcon col="status" />
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort('cvRelevanceScore')}>
                      CV Score <SortIcon col="cvRelevanceScore" />
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort('examScore')}>
                      Exam <SortIcon col="examScore" />
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort('finalScore')}>
                      Final <SortIcon col="finalScore" />
                    </th>
                    <th className="p-3">XAI</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((app, idx) => (
                    <tr key={app.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="accent-primary"
                        />
                      </td>
                      <td className="p-3 text-muted-foreground">{page * PAGE_SIZE + idx + 1}</td>
                      <td className="p-3 font-medium">App #{app.id}</td>
                      <td className="p-3">
                        <Badge variant={STATUS_VARIANT[app.status] ?? 'default'}>
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {app.cvRelevanceScore != null ? `${(app.cvRelevanceScore * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="p-3">
                        {app.examScore != null ? app.examScore.toFixed(1) : '—'}
                      </td>
                      <td className="p-3 font-semibold">
                        {app.finalScore != null ? app.finalScore.toFixed(1) : '—'}
                      </td>
                      <td className="p-3">
                        <button
                          className="text-xs text-primary underline"
                          onClick={() => setXaiAppId(app.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {xaiAppId !== null && (
        <XaiDrawer appId={xaiAppId} onClose={() => setXaiAppId(null)} />
      )}
    </div>
  )
}
