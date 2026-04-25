import { useEffect, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { availabilityApi, type AvailabilitySlot } from '@/api/availability'
import { applicationsApi } from '@/api/applications'

export function InterviewSlotPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null)
  const [confirmed, setConfirmed] = useState<AvailabilitySlot | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    availabilityApi.getAvailableSlots().then((r) => setSlots(r.data.data)).catch(() => {})
    // Fetch the shortlisted application id
    applicationsApi.list().then((r) => {
      const shortlisted = r.data.data.find((a) => a.status === 'SHORTLISTED')
      if (shortlisted) setApplicationId(shortlisted.id)
      const booked = r.data.data.find((a) => a.status === 'INTERVIEW_SCHEDULED')
      if (booked && booked.interviewSlotDate) {
        setConfirmed({
          id: 0, slotDate: booked.interviewSlotDate,
          startTime: booked.interviewSlotTime ?? '', endTime: '', booked: true,
        })
      }
    }).catch(() => {})
  }, [])

  const handleBook = async () => {
    if (!selected || !applicationId) return
    setLoading(true)
    try {
      await applicationsApi.bookSlot(applicationId, selected.id)
      setConfirmed(selected)
      setConfirmOpen(false)
    } catch {
      // show error
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Interview Confirmed!</h2>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">{confirmed.slotDate}</span>
              {confirmed.startTime && <> at <span className="text-foreground font-medium">{confirmed.startTime}</span></>}
            </p>
            <p className="text-sm text-muted-foreground">A confirmation email has been sent to you.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!applicationId) {
    return (
      <p className="text-muted-foreground text-center py-16">
        Slot booking opens once you are shortlisted.
      </p>
    )
  }

  const byDate = slots.reduce<Record<string, AvailabilitySlot[]>>((acc, s) => {
    ;(acc[s.slotDate] ??= []).push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Book Interview Slot</h1>
        <p className="text-muted-foreground mt-1">Select a time that works for you.</p>
      </div>

      {Object.entries(byDate).map(([date, daySlots]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle className="text-base">{date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.booked}
                  onClick={() => { if (!slot.booked) { setSelected(slot); setConfirmOpen(true) } }}
                  className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                    slot.booked
                      ? 'border-border bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-50'
                      : selected?.id === slot.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {slot.startTime} – {slot.endTime}
                  {slot.booked && <span className="ml-1 text-xs">(Booked)</span>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          {selected && (
            <p className="text-sm text-muted-foreground">
              Book interview on <span className="text-foreground font-medium">{selected.slotDate}</span> at{' '}
              <span className="text-foreground font-medium">{selected.startTime} – {selected.endTime}</span>?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleBook} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
