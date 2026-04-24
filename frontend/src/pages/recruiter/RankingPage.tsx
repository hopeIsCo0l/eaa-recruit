import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { applicationsApi, type Application } from '@/api/applications'
import { jobsApi, type JobPosting } from '@/api/jobs'
import { XaiDrawer } from '@/components/recruiter/XaiDrawer'
import { BatchToolbar } from '@/components/recruiter/BatchToolbar'

type SortKey = 'finalScore' | 'cvRelevanceScore' | 'examScore' | 'status'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

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
  const [xaiApp, setXaiApp] = useState<Application | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [search, setSearch] = useState('')

  useEffect(() => {
    jobsApi.list().then((r) => setJobs(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedJobId) return
    setLoading(true)
    setSelectedIds(new Set())
    setPage(0)
    applicationsApi
      .listByJob(selectedJobId)
      .then((r) => setApps(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedJobId])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return apps
    return apps.filter((a) => (a.candidateName ?? `App #${a.id}`).toLowerCase().includes(q))
  }, [apps, search])

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const av = (a[sortKey] as number | string | undefined) ?? ''
        const bv = (b[sortKey] as number | string | undefined) ?? ''
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      }),
    [filtered, sortKey, sortDir]
  )

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageSlice = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === pageSlice.length && pageSlice.length > 0
        ? new Set()
        : new Set(pageSlice.map((a) => a.id))
    )

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'desc' ? (
        <ChevronDown className="h-3 w-3 inline ml-1" />
      ) : (
        <ChevronUp className="h-3 w-3 inline ml-1" />
      )
    ) : null

  const reload = () => {
    if (!selectedJobId) return
    setLoading(true)
    setSelectedIds(new Set())
    applicationsApi
      .listByJob(selectedJobId)
      .then((r) => setApps(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const selectedApps = pageSlice
    .filter((a) => selectedIds.has(a.id))
    .map((a) => ({ id: a.id, status: a.status }))

  return (
    <div className="space-y-4">
      {/* Toolbar row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Candidate Rankings</h1>
        <select
          className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground"
          value={selectedJobId ?? ''}
          onChange={(e) => {
            setSelectedJobId(Number(e.target.value) || null)
            setPage(0)
            setSearch('')
          }}
        >
          <option value="">Select a job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>

      {/* Search + page size */}
      {selectedJobId && !loading && apps.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Per page:</span>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => { setPageSize(n); setPage(0) }}
                className={`px-2.5 py-1 rounded border text-xs transition-colors ${
                  pageSize === n
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Batch toolbar */}
      {selectedIds.size > 0 && (
        <BatchToolbar selectedApps={selectedApps} onDone={reload} />
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
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No candidates match your search.</p>
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
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                      Status <SortIcon col="status" />
                    </th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('cvRelevanceScore')}>
                      CV Score <SortIcon col="cvRelevanceScore" />
                    </th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('examScore')}>
                      Exam <SortIcon col="examScore" />
                    </th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('finalScore')}>
                      Final <SortIcon col="finalScore" />
                    </th>
                    <th className="p-3">Hard Filter</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((app, idx) => (
                    <tr
                      key={app.id}
                      className="border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer"
                      onClick={() => setXaiApp(app)}
                    >
                      <td
                        className="p-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="accent-primary"
                        />
                      </td>
                      <td className="p-3 text-muted-foreground">{page * pageSize + idx + 1}</td>
                      <td className="p-3 font-medium">
                        {app.candidateName ?? `Applicant #${app.id}`}
                      </td>
                      <td className="p-3">
                        <Badge variant={STATUS_VARIANT[app.status] ?? 'default'}>
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {app.cvRelevanceScore != null
                          ? `${(app.cvRelevanceScore * 100).toFixed(1)}%`
                          : '—'}
                      </td>
                      <td className="p-3">
                        {app.examScore != null ? app.examScore.toFixed(1) : '—'}
                      </td>
                      <td className="p-3 font-semibold">
                        {app.finalScore != null ? app.finalScore.toFixed(1) : '—'}
                      </td>
                      <td className="p-3">
                        {app.hardFilterPassed == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : app.hardFilterPassed ? (
                          <Badge variant="success">Pass</Badge>
                        ) : (
                          <Badge variant="destructive">Fail</Badge>
                        )}
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
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {xaiApp !== null && (
        <XaiDrawer
          appId={xaiApp.id}
          candidateName={xaiApp.candidateName}
          onClose={() => setXaiApp(null)}
        />
      )}
    </div>
  )
}
