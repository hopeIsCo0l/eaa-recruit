import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plane, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authApi } from '@/api/auth'

const schema = z.object({
  fullName:    z.string().min(2, 'Name must be at least 2 characters'),
  email:       z.email('Invalid email'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(7, 'Enter a valid phone number'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await authApi.register(data)
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Plane className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Apply for aviation roles at EAA</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(['fullName', 'email', 'phone'] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>
                  {{ fullName: 'Full Name', email: 'Email', phone: 'Phone Number' }[field]}
                </Label>
                <Input
                  id={field}
                  type={field === 'email' ? 'email' : 'text'}
                  {...register(field)}
                />
                {errors[field] && (
                  <p className="text-xs text-destructive">{errors[field]?.message}</p>
                )}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
