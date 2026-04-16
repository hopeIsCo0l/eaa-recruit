import { useEffect, useRef, useState } from 'react'
import { Search, Upload, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter as DFooter } from '@/components/ui/dialog'
import { jobsApi, type JobPosting } from '@/api/jobs'
import { applicationsApi } from '@/api/applications'

export function JobBoardPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState<Set<number>>(new Set())
  const [applyJobId, setApplyJobId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    jobsApi.list({ status: 'OPEN' }).then((r) => setJobs(r.data.data)).catch(() => {})
  }, [])

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.requiredDegree.toLowerCase().includes(search.toLowerCase())
  )

  const validateFile = (f: File) => {
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)) {
      setFileError('Only PDF or DOCX files are accepted')
      return false
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5 MB')
      return false
    }
    setFileError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) setFile(f)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) setFile(f)
  }

  const handleApply = async () => {
    if (!applyJobId || !file) return
    setSubmitting(true)
    try {
      await applicationsApi.submit(applyJobId, file)
      setApplied((prev) => new Set([...prev, applyJobId]))
      setApplyJobId(null)
      setFile(null)
    } catch {
      setFileError('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or degree…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-16">No open positions found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{job.title}</CardTitle>
                {applied.has(job.id) && <Badge variant="success">Applied</Badge>}
              </div>
              <CardDescription className="line-clamp-2">{job.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
              <p>Degree: <span className="text-foreground">{job.requiredDegree}</span></p>
              <p>Min height: <span className="text-foreground">{job.minHeightCm} cm</span></p>
              <p>Closes: <span className="text-foreground">{job.closeDate}</span></p>
              <p>Exam: <span className="text-foreground">{job.examDate}</span></p>
            </CardContent>
            <CardFooter>
              {applied.has(job.id) ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" /> Application submitted
                </div>
              ) : (
                <Button className="w-full" onClick={() => { setApplyJobId(job.id); setFile(null); setFileError(null) }}>
                  Apply Now
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Apply modal */}
      <Dialog open={applyJobId !== null} onOpenChange={() => setApplyJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Your CV</DialogTitle>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {file ? (
              <p className="text-sm text-foreground font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-foreground font-medium">Drag &amp; drop your CV here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF or DOCX · max 5 MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
          </div>
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          <DFooter>
            <Button variant="outline" onClick={() => setApplyJobId(null)}>Cancel</Button>
            <Button onClick={handleApply} disabled={!file || submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit Application
            </Button>
          </DFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
