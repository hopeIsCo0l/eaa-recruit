import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle, XCircle, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { applicationsApi, type FeedbackReport } from '@/api/applications'

interface Props {
  appId: number
  candidateName?: string
  onClose: () => void
}

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa']

export function XaiDrawer({ appId, candidateName, onClose }: Props) {
  const [report, setReport] = useState<FeedbackReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)

    applicationsApi
      .getFeedback(appId)
      .then((r) => setReport(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    applicationsApi
      .getXaiReport(appId)
      .then((r) => {
        const url = URL.createObjectURL(new Blob([r.data as BlobPart], { type: 'application/pdf' }))
        setPdfUrl(url)
      })
      .catch(() => {})

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [appId])

  const scoreData = report
    ? [
        { name: 'CV Score', value: Number(((report.cvRelevanceScore ?? 0) * 100).toFixed(1)) },
        { name: 'Exam Score', value: Number((report.examScore ?? 0).toFixed(1)) },
        { name: 'Final Score', value: Number((report.finalScore ?? 0).toFixed(1)) },
      ]
    : []

  const handleDownload = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `xai-report-${appId}.pdf`
    a.click()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold">
              {candidateName ?? `Application #${appId}`}
            </h2>
            {report?.finalScore != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Final Score: <span className="text-foreground font-medium">{report.finalScore.toFixed(1)}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Report
              </Button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && !loading && (
            <p className="text-muted-foreground text-center py-16 text-sm">
              Report not yet available for this application.
            </p>
          )}

          {report && !loading && (
            <>
              {/* Hard filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Hard Filter</span>
                {report.hardFilterPassed == null ? (
                  <Badge variant="secondary">N/A</Badge>
                ) : report.hardFilterPassed ? (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" /> Passed
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> Failed
                  </Badge>
                )}
              </div>

              {/* Score breakdown chart */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Score Breakdown (SHAP/LIME)</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart
                    data={scoreData}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={82} />
                    <Tooltip formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : '', 'Score']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: unknown) => typeof v === 'number' ? v.toFixed(1) : '' }}>
                      {scoreData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Individual score cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'CV Score', value: report.cvRelevanceScore != null ? `${(report.cvRelevanceScore * 100).toFixed(1)}%` : '—' },
                  { label: 'Exam Score', value: report.examScore != null ? report.examScore.toFixed(1) : '—' },
                  { label: 'Final Score', value: report.finalScore != null ? report.finalScore.toFixed(1) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Natural language justification */}
              {report.decisionNotes && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">XAI Justification</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-md p-3">
                    {report.decisionNotes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
