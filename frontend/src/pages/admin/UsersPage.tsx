import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, PlusCircle, Search, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { adminApi, type User } from '@/api/admin'
import { showToast } from '@/hooks/useToast'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
})
type FormValues = z.infer<typeof schema>

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [toggling, setToggling] = useState<number | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const reload = () => {
    setLoading(true)
    adminApi
      .listUsers()
      .then((r) => setUsers(r.data.data))
      .catch(() => showToast({ title: 'Failed to load users', variant: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const onCreateRecruiter = async (values: FormValues) => {
    try {
      await adminApi.createRecruiter(values)
      reset()
      setCreateOpen(false)
      showToast({ title: 'Recruiter created', variant: 'success' })
      reload()
    } catch {
      showToast({ title: 'Failed to create recruiter', variant: 'error' })
    }
  }

  const toggleStatus = async (user: User) => {
    setToggling(user.id)
    try {
      await adminApi.setUserStatus(user.id, !user.active)
      showToast({ title: user.active ? 'User deactivated' : 'User activated', variant: 'success' })
      reload()
    } catch {
      showToast({ title: 'Failed to update status', variant: 'error' })
    } finally {
      setToggling(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email…"
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Create Recruiter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              {search ? 'No users match your search.' : 'No users found.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border hover:bg-secondary/40 transition-colors">
                      <td className="p-3 font-medium">{u.fullName}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <Badge variant="outline">{u.role}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.active ? 'success' : 'destructive'}>
                          {u.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(u)}
                          disabled={toggling === u.id}
                        >
                          {toggling === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : u.active ? (
                            <><UserX className="h-3 w-3 mr-1" />Deactivate</>
                          ) : (
                            <><UserCheck className="h-3 w-3 mr-1" />Activate</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Recruiter Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateRecruiter)} className="space-y-3">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
