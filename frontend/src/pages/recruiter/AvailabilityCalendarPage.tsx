import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { availabilityApi, type AvailabilitySlot } from '@/api/availability'

interface NewSlot {
  slotDate: string
  startTime: string
  endTime: string
}

const EMPTY: NewSlot = { slotDate: '', startTime: '', endTime: '' }

export function AvailabilityCalendarPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [drafts, setDrafts] = useState<NewSlot[]>([{ ...EMPTY }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const reload = () =>
    availabilityApi.getMySlots().then((r) => setSlots(r.data.data)).catch(() => {})

  useEffect(() => { reload() }, [])

  const byDate = slots.reduce<Record<string, AvailabilitySlot[]>>((acc, s) => {
    ;(acc[s.slotDate] ??= []).push(s)
    return acc
  }, {})

  const updateDraft = (i: number, field: keyof NewSlot, value: string) =>
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)))

  const removeDraft = (i: number) =>
    setDrafts((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    const valid = drafts.filter((d) => d.slotDate && d.startTime && d.endTime)
    if (valid.length === 0) { setError('Fill in at least one slot.'); return }
    if (valid.some((d) => d.endTime <= d.startTime)) {
      setError('End time must be after start time.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await availabilityApi.createSlots(valid)
      setDrafts([{ ...EMPTY }])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      reload()
    } catch {
      setError('Failed to save slots — please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Interview Availability</h1>

      {/* Existing slots */}
      {Object.keys(byDate).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(byDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, daySlots]) => (
                <div key={date}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{date}</p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <Badge key={s.id} variant={s.booked ? 'secondary' : 'outline'}>
                        {s.startTime} – {s.endTime}
                        {s.booked && ' (booked)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Add new slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Availability Slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {drafts.map((draft, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={draft.slotDate}
                  onChange={(e) => updateDraft(i, 'slotDate', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Start</Label>
                <Input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => updateDraft(i, 'startTime', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>End</Label>
                <Input
                  type="time"
                  value={draft.endTime}
                  onChange={(e) => updateDraft(i, 'endTime', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeDraft(i)}
                disabled={drafts.length === 1}
                className="mb-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrafts((prev) => [...prev, { ...EMPTY }])}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Another Slot
          </Button>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-green-400">Slots saved successfully.</p>}

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Slots
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
