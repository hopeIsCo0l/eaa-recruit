import { useEffect, useState } from 'react'
import { Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { applicationsApi, type FeedbackReport } from '@/api/applications'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const DECISION_CONFIG = {
  SELECTED:   { label: 'Congratulations — You have been selected!', color: 'success' as const, emoji: '🎉' },
  REJECTED:   { label: 'Thank you for applying. Keep pursuing your aviation career.', color: 'destructive' as const, emoji: '✈️' },
  WAITLISTED: { label: "You're on the waitlist — we'll be in touch.", color: 'warning' as const, emoji: '⏳' },
}

export function ResultsPage() {
  const [reports, setReports] = useState<FeedbackReport[]>([])
  const [pdfBlob, setPdfBlob] = useState<string | null>(null)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [pdfPages, setPdfPages] = useState<number>(1)
  const [loadingPdf, setLoadingPdf] = useState(false)

  useEffect(() => {
    applicationsApi.list().then(async (r) => {
      const finals = r.data.data.filter((a) =>
        ['SELECTED', 'REJECTED', 'WAITLISTED'].includes(a.status)
      )
      const feedbacks = await Promise.allSettled(
        finals.map((a) => applicationsApi.getFeedback(a.id).then((fr) => fr.data.data))
      )
      setReports(feedbacks.flatMap((f) => (f.status === 'fulfilled' ? [f.value] : [])))
    }).catch(() => {})
  }, [])

  const handlePreview = async (appId: number) => {
    setLoadingPdf(true)
    try {
      const res = await applicationsApi.getXaiReport(appId)
      const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'application/pdf' }))
      setPdfBlob(url)
      setPdfOpen(true)
    } catch { /* show loading message */ }
    finally { setLoadingPdf(false) }
  }

  const handleDownload = async (appId: number) => {
    const res = await applicationsApi.getXaiReport(appId)
    const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `xai-report-${appId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (reports.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16">
        Results will appear here once a final decision is made on your application.
      </p>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">My Results</h1>

      {reports.map((r) => {
        const cfg = DECISION_CONFIG[r.status as keyof typeof DECISION_CONFIG]
        return (
          <Card key={r.applicationId}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{r.jobTitle}</CardTitle>
                  <p className="text-2xl mt-2">{cfg?.emoji}</p>
                </div>
                <Badge variant={cfg?.color ?? 'default'}>{r.status}</Badge>
              </div>
              {cfg && <p className="text-sm text-muted-foreground mt-2">{cfg.label}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score bars */}
              {[
                { label: 'CV Relevance', value: r.cvRelevanceScore != null ? r.cvRelevanceScore * 100 : null },
                { label: 'Exam Score',   value: r.examScore },
                { label: 'Final Score',  value: r.finalScore },
              ].map(({ label, value }) =>
                value != null ? (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value.toFixed(1)}%</span>
                    </div>
                    <Progress value={value} />
                  </div>
                ) : null
              )}

              {r.hardFilterPassed != null && (
                <p className="text-sm">
                  Hard filter:{' '}
                  <span className={r.hardFilterPassed ? 'text-green-400' : 'text-destructive'}>
                    {r.hardFilterPassed ? 'Passed' : 'Failed'}
                  </span>
                </p>
              )}

              {r.decisionNotes && (
                <div className="p-3 rounded-md bg-secondary text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Recruiter notes</p>
                  <p>{r.decisionNotes}</p>
                </div>
              )}

              {r.xaiReportUrl && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(r.applicationId)}
                    disabled={loadingPdf}
                  >
                    {loadingPdf ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    Preview Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(r.applicationId)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              )}
              {!r.xaiReportUrl && (
                <p className="text-xs text-muted-foreground">AI report is being generated — check back shortly.</p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* In-browser PDF viewer */}
      <Dialog open={pdfOpen} onOpenChange={(o) => { setPdfOpen(o); if (!o && pdfBlob) URL.revokeObjectURL(pdfBlob) }}>
        <DialogContent className="max-w-3xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Feedback Report</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto flex justify-center">
            {pdfBlob ? (
              <Document
                file={pdfBlob}
                onLoadSuccess={({ numPages }) => setPdfPages(numPages)}
              >
                {Array.from({ length: pdfPages }, (_, i) => (
                  <Page key={i + 1} pageNumber={i + 1} width={600} className="mb-4" />
                ))}
              </Document>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
