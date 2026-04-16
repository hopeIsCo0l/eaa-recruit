import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { profileApi } from '@/api/profile'

const schema = z.object({
  heightCm:       z.coerce.number().min(100).max(250),
  weightKg:       z.coerce.number().min(30).max(300),
  degree:         z.string().min(2, 'Required'),
  fieldOfStudy:   z.string().min(2, 'Required'),
  graduationYear: z.coerce.number().min(1970).max(new Date().getFullYear()),
})
type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const navigate = useNavigate()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    profileApi.get().then((r) => reset(r.data.data as FormData)).catch(() => {})
  }, [reset])

  const onSubmit = async (data: FormData) => {
    await profileApi.update(data)
    navigate('/jobs')
  }

  const fields: { name: keyof FormData; label: string; type?: string }[] = [
    { name: 'heightCm',       label: 'Height (cm)',       type: 'number' },
    { name: 'weightKg',       label: 'Weight (kg)',       type: 'number' },
    { name: 'degree',         label: 'Highest Degree' },
    { name: 'fieldOfStudy',   label: 'Field of Study' },
    { name: 'graduationYear', label: 'Graduation Year',   type: 'number' },
  ]

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Required for the application hard-filter check</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(({ name, label, type }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} type={type ?? 'text'} {...register(name)} />
                {errors[name] && (
                  <p className="text-xs text-destructive">{errors[name]?.message}</p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
