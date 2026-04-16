import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { applicationsApi } from '@/api/applications'

interface Props {
  selectedIds: number[]
  jobId: number
  onDone: () => void
}

type Action = 'shortlist' | 'reject' | 'select' | 'waitlist'

const ACTION_LABELS: Record<Action, string> = {
  shortlist: 'Shortlist',
  reject: 'Reject',
  select: 'Select',
  waitlist: 'Waitlist',
}

const ACTION_VARIANT: Record<Action, 'default' | 'destructive' | 'outline'> = {
  shortlist: 'default',
  reject: 'destructive',
  select: 'default',
  waitlist: 'outline',
}

export function BatchToolbar({ selectedIds, onDone }: Props) {
  const [pending, setPending] = useState<Action | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    if (!pending) return
    setLoading(true)
    try {
      if (pending === 'shortlist') {
        await applicationsApi.shortlist(selectedIds)
      } else {
        const decision =
          pending === 'reject' ? 'REJECTED' : pending === 'select' ? 'SELECTED' : 'WAITLISTED'
        await Promise.all(selectedIds.map((id) => applicationsApi.recordDecision(id, decision)))
      }
      onDone()
    } catch {
      // keep toolbar open — user can retry
    } finally {
      setLoading(false)
      setPending(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
        <span className="text-sm text-muted-foreground font-medium">
          {selectedIds.length} selected
        </span>
        <div className="flex gap-2 ml-auto flex-wrap">
          {(Object.keys(ACTION_LABELS) as Action[]).map((action) => (
            <Button
              key={action}
              size="sm"
              variant={ACTION_VARIANT[action]}
              onClick={() => setPending(action)}
            >
              {ACTION_LABELS[action]}
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={pending !== null} onOpenChange={() => setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Batch Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pending && (
              <>
                <span className="font-medium text-foreground">{ACTION_LABELS[pending]}</span>{' '}
                {selectedIds.length} candidate{selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.
              </>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirm}
              disabled={loading}
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
