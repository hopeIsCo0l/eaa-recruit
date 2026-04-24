import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/auth'
import {
  LayoutDashboard, Briefcase, FileText, BookOpen, Calendar,
  Trophy, Users, Activity, ScrollText, BarChart3, Brain,
  ClipboardList, Settings, LogOut,
} from 'lucide-react'
import { EaaLogo } from '@/components/EaaLogo'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  CANDIDATE: [
    { label: 'Dashboard',        to: '/dashboard',     icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Jobs',             to: '/jobs',          icon: <Briefcase className="h-4 w-4" /> },
    { label: 'My Applications',  to: '/applications',  icon: <FileText className="h-4 w-4" /> },
    { label: 'My Exam',          to: '/exam',          icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Interview Slot',   to: '/interview',     icon: <Calendar className="h-4 w-4" /> },
    { label: 'Results',          to: '/results',       icon: <Trophy className="h-4 w-4" /> },
  ],
  RECRUITER: [
    { label: 'Dashboard',        to: '/dashboard',     icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Post Job',         to: '/jobs/new',      icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Applications',     to: '/applications',  icon: <FileText className="h-4 w-4" /> },
    { label: 'Exam Management',  to: '/exams',         icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Interview Calendar', to: '/availability', icon: <Calendar className="h-4 w-4" /> },
    { label: 'Decisions',        to: '/decisions',     icon: <ClipboardList className="h-4 w-4" /> },
  ],
  ADMIN: [
    { label: 'User Management',  to: '/admin/users',    icon: <Users className="h-4 w-4" /> },
    { label: 'System Health',    to: '/admin/health',   icon: <Activity className="h-4 w-4" /> },
    { label: 'Audit Logs',       to: '/admin/audit',    icon: <ScrollText className="h-4 w-4" /> },
    { label: 'Analytics',        to: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ],
  SUPER_ADMIN: [
    { label: 'User Management',  to: '/admin/users',    icon: <Users className="h-4 w-4" /> },
    { label: 'System Health',    to: '/admin/health',   icon: <Activity className="h-4 w-4" /> },
    { label: 'Audit Logs',       to: '/admin/audit',    icon: <ScrollText className="h-4 w-4" /> },
    { label: 'Analytics',        to: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'AI Model',         to: '/admin/ai-model', icon: <Brain className="h-4 w-4" /> },
    { label: 'Settings',         to: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
  ],
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const items = user ? (NAV_BY_ROLE[user.role] ?? []) : []

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border w-64">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <EaaLogo size={32} className="shrink-0" />
        <div>
          <p className="font-semibold text-foreground text-sm">EAA Recruit</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 mb-2">
          <p className="text-sm font-medium text-foreground truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
