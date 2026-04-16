import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { applicationsApi, type Application, type ApplicationStatus } from '@/api/applications'

const STAGES: { status: ApplicationStatus[]; label: string }[] = [
  { status: ['SUBMITTED'],          label: 'Applied' },
  { status: ['AI_SCREENING'],       label: 'AI Screening' },
  { status: ['EXAM_AUTHORIZED', 'EXAM_COMPLETED'], label: 'Exam' },
  { status: ['SHORTLISTED', 'INTERVIEW_SCHEDULED'], label: 'Interview' },
  { status: ['SELECTED', 'REJECTED', 'WAITLISTED'], label: 'Decision' },
]

const STATUS_VARIANT: Record<ApplicationStatus, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  SUBMITTED:            'secondary',
  AI_SCREENING:         'default',
  HARD_FILTER_FAILED:   'destructive',
  EXAM_AUTHORIZED:      'warning',
  EXAM_COMPLETED:       'default',
  SHORTLISTED:          'default',
  INTERVIEW_SCHEDULED:  'warning',
  SELECTED:             'success',
  REJECTED:             'destructive',
  WAITLISTED:           'secondary',
}

function StageIcon({ done, current, failed }: { done: boolean; current: boolean; failed: boolean }) {
  if (failed)   return <XCircle className="h-5 w-5 text-destructive" />
  if (done)     return <CheckCircle2 className="h-5 w-5 text-green-500" />
  if (current)  return <Clock className="h-5 w-5 text-primary animate-pulse" />
  return <Circle className="h-5 w-5 text-muted-foreground/30" />
}

function Timeline({ app }: { app: Application }) {
  const currentStageIdx = STAGES.findIndex((s) => s.status.includes(app.status))
  const failed = app.status === 'HARD_FILTER_FAILED'

  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const done    = i < currentStageIdx
        const current = i === currentStageIdx
        const stageFailed = failed && i === 1

        return (
          <div key={stage.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <StageIcon done={done} current={current} failed={stageFailed} />
              <span className={`text-xs whitespace-nowrap ${current ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-px w-8 mx-1 mb-5 ${done ? 'bg-green-500' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const load = () => applicationsApi.list().then((r) => setApps(r.data.data)).catch(() => {})
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  if (apps.length === 0)
    return <p className="text-muted-foreground text-center py-16">No applications yet. Browse jobs to apply!</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>
      {apps.map((app) => (
        <Card
          key={app.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setExpanded(expanded === app.id ? null : app.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{app.jobTitle}</CardTitle>
              <Badge variant={STATUS_VARIANT[app.status]}>{app.status.replace(/_/g, ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Timeline app={app} />
            </div>
            {expanded === app.id && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border text-sm">
                {app.cvRelevanceScore != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">CV Score</p>
                    <p className="font-medium">{(app.cvRelevanceScore * 100).toFixed(1)}%</p>
                  </div>
                )}
                {app.examScore != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Exam Score</p>
                    <p className="font-medium">{app.examScore.toFixed(1)}</p>
                  </div>
                )}
                {app.hardFilterPassed != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Hard Filter</p>
                    <p className={`font-medium ${app.hardFilterPassed ? 'text-green-400' : 'text-destructive'}`}>
                      {app.hardFilterPassed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                )}
                {app.finalScore != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Final Score</p>
                    <p className="font-medium">{app.finalScore.toFixed(1)}</p>
                  </div>
                )}
                {app.status === 'HARD_FILTER_FAILED' && (
                  <div className="col-span-full flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Your profile does not meet the minimum physical/academic requirements for this role.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
