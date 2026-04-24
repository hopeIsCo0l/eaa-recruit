import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { applicationsApi, type ApplicationStatus } from '@/api/applications'
import { showToast } from '@/hooks/useToast'

export interface SelectedApp {
  id: number
  status: ApplicationStatus
}

interface Props {
  selectedApps: SelectedApp[]
  onDone: () => void
}

type Action = 'authorize' | 'reject'

export function BatchToolbar({ selectedApps, onDone }: Props) {
  const [pending, setPending] = useState<Action | null>(null)
  const [loading, setLoading] = useState(false)

  const eligibleIds = selectedApps.filter((a) => a.status === 'AI_SCREENING').map((a) => a.id)
  const allIds = selectedApps.map((a) => a.id)
  const skipped = selectedApps.length - eligibleIds.length

  const confirm = async () => {
    if (!pending) return
    setLoading(true)
    try {
      if (pending === 'authorize') {
        await applicationsApi.authorizeExam(eligibleIds)
        showToast({
          title: `${eligibleIds.length} candidate${eligibleIds.length !== 1 ? 's' : ''} authorized for exam`,
          variant: 'success',
        })
      } else {
        await Promise.all(allIds.map((id) => applicationsApi.recordDecision(id, 'REJECTED')))
        showToast({
          title: `${allIds.length} candidate${allIds.length !== 1 ? 's' : ''} rejected`,
          variant: 'default',
        })
      }
      onDone()
    } catch {
      showToast({ title: 'Action failed — please try again', variant: 'error' })
    } finally {
      setLoading(false)
      setPending(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
        <span className="text-sm text-muted-foreground font-medium">
          {selectedApps.length} selected
        </span>
        <div className="flex gap-2 ml-auto flex-wrap">
          <Button
            size="sm"
            disabled={eligibleIds.length === 0}
            onClick={() => setPending('authorize')}
            title={eligibleIds.length === 0 ? 'Select candidates in AI Screening stage to authorize' : undefined}
          >
            Authorize for Exam
            {eligibleIds.length > 0 && eligibleIds.length < selectedApps.length && (
              <span className="ml-1 opacity-70 text-xs">({eligibleIds.length})</span>
            )}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setPending('reject')}>
            Send Rejection
          </Button>
        </div>
      </div>

      <Dialog open={pending !== null} onOpenChange={() => setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Batch Action</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-1">
            {pending === 'authorize' && (
              <>
                <p>
                  Authorize{' '}
                  <span className="font-medium text-foreground">{eligibleIds.length}</span>{' '}
                  candidate{eligibleIds.length !== 1 ? 's' : ''} for the exam?
                </p>
                {skipped > 0 && (
                  <p className="text-xs">
                    {skipped} selected candidate{skipped !== 1 ? 's' : ''} skipped — only{' '}
                    <span className="font-medium text-foreground">AI Screening</span> stage candidates can be authorized.
                  </p>
                )}
              </>
            )}
            {pending === 'reject' && (
              <p>
                Send rejection to{' '}
                <span className="font-medium text-foreground">{allIds.length}</span>{' '}
                candidate{allIds.length !== 1 ? 's' : ''}? This cannot be undone.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirm}
              disabled={loading || (pending === 'authorize' && eligibleIds.length === 0)}
              variant={pending === 'reject' ? 'destructive' : 'default'}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
