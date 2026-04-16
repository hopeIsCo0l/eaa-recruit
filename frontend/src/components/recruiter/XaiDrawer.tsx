import { useEffect, useState } from 'react'
import { X, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { applicationsApi } from '@/api/applications'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface Props {
  appId: number
  onClose: () => void
}

export function XaiDrawer({ appId, onClose }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    applicationsApi
      .getXaiReport(appId)
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'application/pdf' }))
        setPdfUrl(url)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [appId])

  const handleDownload = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `xai-report-${appId}.pdf`
    a.click()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">XAI Report — Application #{appId}</h2>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex justify-center p-4">
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && !loading && (
            <p className="text-muted-foreground text-center py-16 text-sm">
              Report not yet available for this application.
            </p>
          )}
          {pdfUrl && !loading && (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page key={i + 1} pageNumber={i + 1} width={440} className="mb-4" />
              ))}
            </Document>
          )}
        </div>
      </div>
    </>
  )
}
