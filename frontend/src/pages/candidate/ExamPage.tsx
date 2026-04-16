import { useEffect, useRef, useState, useCallback } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import apiClient from '@/api/client'

interface Question {
  id: number
  text: string
  options: string[]
  questionNumber: number
}

interface ExamSession {
  examId: number
  token: string
  durationMinutes: number
  questions: Question[]
}

export function ExamPage() {
  const [session, setSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    apiClient.get<{ data: ExamSession }>('/exam/session')
      .then((r) => {
        setSession(r.data.data)
        setSecondsLeft(r.data.data.durationMinutes * 60)
      })
      .catch(() => {})
  }, [])

  const submitExam = useCallback(async () => {
    if (!session) return
    try {
      await apiClient.post(`/exam/${session.examId}/submit`, { token: session.token })
      setSubmitted(true)
    } catch { /* no-op */ }
  }, [session])

  useEffect(() => {
    if (!session || submitted) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          submitExam()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [session, submitted, submitExam])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!submitted) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [submitted])

  const saveAnswer = async (questionId: number, answer: string) => {
    if (!session) return
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    await apiClient.post('/exam/submit-answer', {
      token: session.token,
      questionId,
      answer,
    }).catch(() => {})
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timerColor = secondsLeft < 300 ? 'text-red-400' : 'text-foreground'

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Exam Submitted</h2>
            <p className="text-muted-foreground">Your answers have been recorded. Results will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">No active exam session. Check back when your exam is authorized.</p>
      </div>
    )
  }

  const q = session.questions[currentIdx]
  const answeredCount = Object.keys(answers).length
  const totalCount = session.questions.length
  const progressPct = (answeredCount / totalCount) * 100

  return (
    // Sidebar is hidden via router — full-screen layout
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Timer + progress */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1 mr-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount}/{totalCount} answered</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} />
        </div>
        <div className={`text-2xl font-mono font-bold tabular-nums ${timerColor}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Question {currentIdx + 1} of {totalCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-foreground">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => saveAnswer(q.id, opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  answers[q.id] === opt
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {currentIdx < totalCount - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => i + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setConfirmLeave(true)} variant="default">
            Submit Exam
          </Button>
        )}
      </div>

      {/* Question grid */}
      <div className="flex flex-wrap gap-2">
        {session.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
              answers[session.questions[i].id]
                ? 'bg-primary text-white'
                : i === currentIdx
                ? 'bg-secondary text-foreground ring-1 ring-primary'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" /> Submit exam?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You have answered {answeredCount} of {totalCount} questions.
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>Cancel</Button>
            <Button onClick={submitExam}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
