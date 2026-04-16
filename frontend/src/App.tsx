import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

function App() {
  const { isAuthenticated, user, login, logout } = useAuthStore()

  const handleDemoLogin = () => {
    login('demo-token', {
      id: 1,
      email: 'demo@eaa.com',
      fullName: 'Demo User',
      role: 'CANDIDATE',
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">✈</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            EAA Recruit
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          AI-Powered Aviation Recruitment Platform
        </p>
      </header>

      {/* Auth status card */}
      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
          <CardDescription>
            Zustand store persisted to localStorage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={isAuthenticated ? 'text-green-400' : 'text-muted-foreground'}>
              {isAuthenticated ? 'Authenticated' : 'Guest'}
            </span>
          </div>
          {user && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User</span>
                <span className="text-foreground">{user.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="text-primary font-mono text-xs">{user.role}</span>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="gap-3">
          {isAuthenticated ? (
            <Button variant="outline" className="w-full" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button className="w-full" onClick={handleDemoLogin}>
              Demo Login
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {[
          { title: 'CV Screening', desc: 'AI-powered relevance scoring via SBERT', icon: '📄' },
          { title: 'Exam Engine', desc: 'Concurrent batch exam management', icon: '📝' },
          { title: 'Interview Scheduling', desc: 'Slot booking with conflict prevention', icon: '📅' },
          { title: 'XAI Feedback', desc: 'Explainable AI reports for candidates', icon: '🔍' },
        ].map((f) => (
          <Card key={f.title} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{f.icon}</span>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <footer className="mt-12 text-muted-foreground text-sm">
        Vite {import.meta.env.VITE_APP_VERSION ?? ''} · React 18 · TypeScript · Tailwind v4 · Shadcn/UI · Zustand
      </footer>
    </div>
  )
}

export default App
