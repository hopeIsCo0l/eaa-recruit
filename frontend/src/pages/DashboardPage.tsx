import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { EaaLogo } from '@/components/EaaLogo'
import type { UserRole } from '@/types/auth'

const QUICK_LINKS: Record<UserRole, { label: string; to: string; desc: string }[]> = {
  CANDIDATE: [
    { label: 'Browse Jobs',       to: '/jobs',         desc: 'Find open positions' },
    { label: 'My Applications',   to: '/applications', desc: 'Track your pipeline status' },
    { label: 'My Exam',           to: '/exam',         desc: 'Take your pending exam' },
    { label: 'Interview Slot',    to: '/interview',    desc: 'Book or view your slot' },
    { label: 'Results',           to: '/results',      desc: 'View final decision' },
    { label: 'Profile',           to: '/profile',      desc: 'Update your details' },
  ],
  RECRUITER: [
    { label: 'Post a Job',        to: '/jobs/new',     desc: 'Create a new job posting' },
    { label: 'Applications',      to: '/applications', desc: 'Review candidates' },
    { label: 'Rankings',          to: '/recruiter/rankings', desc: 'Weighted scores & shortlist' },
    { label: 'Interview Calendar',to: '/availability', desc: 'Manage your availability' },
  ],
  ADMIN: [
    { label: 'User Management',   to: '/admin/users',  desc: 'Create and manage users' },
    { label: 'System Health',     to: '/admin/health', desc: 'Services and metrics' },
    { label: 'Audit Logs',        to: '/admin/audit',  desc: 'Full activity trail' },
    { label: 'Analytics',         to: '/admin/analytics', desc: 'Pipeline export' },
  ],
  SUPER_ADMIN: [
    { label: 'User Management',   to: '/admin/users',     desc: 'Create and manage users' },
    { label: 'System Health',     to: '/admin/health',    desc: 'Services and metrics' },
    { label: 'Audit Logs',        to: '/admin/audit',     desc: 'Full activity trail' },
    { label: 'Analytics',         to: '/admin/analytics', desc: 'Pipeline export' },
    { label: 'AI Model',          to: '/admin/ai-model',  desc: 'Manage active model version' },
  ],
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const links = user ? (QUICK_LINKS[user.role] ?? []) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EaaLogo size={48} />
        <div>
          <h1 className="text-2xl font-bold">
            {greeting()}, {user?.fullName?.split(' ')[0]}.
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {user?.role?.toLowerCase().replace('_', ' ')} · EAA Recruit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-5">
                <p className="font-medium text-foreground">{l.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
