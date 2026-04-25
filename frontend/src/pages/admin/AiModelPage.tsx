import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, PlusCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { adminApi, type AiModel } from '@/api/admin'
import { showToast } from '@/hooks/useToast'

const schema = z.object({
  modelVersion: z.string().min(1, 'Version required'),
  description: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function AiModelPage() {
  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [activateTarget, setActivateTarget] = useState<AiModel | null>(null)
  const [activating, setActivating] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const reload = () => {
    setLoading(true)
    adminApi
      .listAiModels()
      .then((r) => setModels(r.data.data))
      .catch(() => showToast({ title: 'Failed to load AI models', variant: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const onRegister = async (values: FormValues) => {
    try {
      await adminApi.registerAiModel(values.modelVersion, values.description ?? '')
      reset()
      setCreateOpen(false)
      showToast({ title: 'Model version registered', variant: 'success' })
      reload()
    } catch {
      showToast({ title: 'Failed to register model', variant: 'error' })
    }
  }

  const confirmActivate = async () => {
    if (!activateTarget) return
    setActivating(true)
    try {
      await adminApi.activateAiModel(activateTarget.id)
      showToast({ title: `${activateTarget.modelVersion} is now active`, variant: 'success' })
      reload()
    } catch {
      showToast({ title: 'Failed to activate model', variant: 'error' })
    } finally {
      setActivating(false)
      setActivateTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Model Versions</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Register Version
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No model versions registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">Version</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3">Activated</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                      <td className="p-3 font-mono font-medium">{m.modelVersion}</td>
                      <td className="p-3 text-muted-foreground">{m.description || '—'}</td>
                      <td className="p-3">
                        {m.active ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <Zap className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {m.activatedAt ? new Date(m.activatedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">
                        {!m.active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivateTarget(m)}
                          >
                            Activate
                          </Button>
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

      {/* Activation confirmation */}
      <Dialog open={activateTarget !== null} onOpenChange={(o) => { if (!o) setActivateTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate model version?</DialogTitle>
          </DialogHeader>
          {activateTarget && (
            <p className="text-sm text-muted-foreground">
              Switch the active model to{' '}
              <span className="font-mono font-medium text-foreground">{activateTarget.modelVersion}</span>?
              This will immediately affect all AI screening requests.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateTarget(null)}>Cancel</Button>
            <Button onClick={confirmActivate} disabled={activating}>
              {activating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register new version */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register AI Model Version</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRegister)} className="space-y-3">
            <div className="space-y-1">
              <Label>Model Version</Label>
              <Input placeholder="e.g. v2.1.0" {...register('modelVersion')} />
              {errors.modelVersion && <p className="text-xs text-destructive">{errors.modelVersion.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Textarea rows={3} {...register('description')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
