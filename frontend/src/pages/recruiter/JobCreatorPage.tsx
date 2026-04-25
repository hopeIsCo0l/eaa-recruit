import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { jobsApi } from '@/api/jobs'

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(1, 'Description is required').refine(
      (v) => v.replace(/<[^>]*>/g, '').trim().length >= 10,
      'Description must be at least 10 characters'
    ),
    minHeightCm: z.coerce.number().int().min(100).max(250),
    minWeightKg: z.coerce.number().int().min(30).max(200),
    requiredDegree: z.string().min(2),
    openDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
    closeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
    examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  })
  .refine((d) => d.closeDate > d.openDate, {
    message: 'Close date must be after open date',
    path: ['closeDate'],
  })
  .refine((d) => d.examDate > d.closeDate, {
    message: 'Exam date must be after close date',
    path: ['examDate'],
  })

type FormValues = z.infer<typeof schema>

export function JobCreatorPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { description: '' } })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await jobsApi.create(values)
      navigate('/recruiter/jobs')
    } catch {
      setServerError('Failed to create job — please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Job Posting</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the role, responsibilities, and requirements…"
                  />
                )}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="requiredDegree">Required Degree</Label>
              <Input id="requiredDegree" placeholder="e.g. BSc Aviation" {...register('requiredDegree')} />
              {errors.requiredDegree && <p className="text-xs text-destructive">{errors.requiredDegree.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="minHeightCm">Min Height (cm)</Label>
                <Input id="minHeightCm" type="number" {...register('minHeightCm')} />
                {errors.minHeightCm && <p className="text-xs text-destructive">{errors.minHeightCm.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="minWeightKg">Min Weight (kg)</Label>
                <Input id="minWeightKg" type="number" {...register('minWeightKg')} />
                {errors.minWeightKg && <p className="text-xs text-destructive">{errors.minWeightKg.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="openDate">Open Date</Label>
                <Input id="openDate" type="date" {...register('openDate')} />
                {errors.openDate && <p className="text-xs text-destructive">{errors.openDate.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="closeDate">Close Date</Label>
                <Input id="closeDate" type="date" {...register('closeDate')} />
                {errors.closeDate && <p className="text-xs text-destructive">{errors.closeDate.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="examDate">Exam Date</Label>
                <Input id="examDate" type="date" {...register('examDate')} />
                {errors.examDate && <p className="text-xs text-destructive">{errors.examDate.message}</p>}
              </div>
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
