import { useAuthStore } from '@/store/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Plane } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuthStore()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Plane className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{greeting()}, {user?.fullName?.split(' ')[0]}.</h1>
          <p className="text-muted-foreground text-sm">Welcome to EAA Recruit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { title: 'CV Screening', desc: 'AI-powered relevance scoring via SBERT', icon: '📄' },
          { title: 'Exam Engine', desc: 'Concurrent batch exam management', icon: '📝' },
          { title: 'Interview Scheduling', desc: 'Slot booking with conflict prevention', icon: '📅' },
          { title: 'XAI Feedback', desc: 'Explainable AI reports for candidates', icon: '🔍' },
          { title: 'Rankings', desc: 'Weighted scoring: CV 40% + Exam 40% + HF 20%', icon: '🏆' },
          { title: 'Audit Logs', desc: 'Full transparency on every status change', icon: '📋' },
        ].map((f) => (
          <Card key={f.title} className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
