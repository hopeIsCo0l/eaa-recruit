import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layout
import { AppShell } from '@/components/layout/AppShell'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { OtpPage } from '@/pages/auth/OtpPage'

// Shared
import { DashboardPage } from '@/pages/DashboardPage'

// Candidate pages
import { JobBoardPage } from '@/pages/candidate/JobBoardPage'
import { ApplicationsPage } from '@/pages/candidate/ApplicationsPage'
import { ExamPage } from '@/pages/candidate/ExamPage'
import { InterviewSlotPage } from '@/pages/candidate/InterviewSlotPage'
import { ResultsPage } from '@/pages/candidate/ResultsPage'
import { ProfilePage } from '@/pages/candidate/ProfilePage'

// Recruiter pages
import { JobCreatorPage } from '@/pages/recruiter/JobCreatorPage'
import { RankingPage } from '@/pages/recruiter/RankingPage'
import { AvailabilityCalendarPage } from '@/pages/recruiter/AvailabilityCalendarPage'

// Admin pages
import { UsersPage } from '@/pages/admin/UsersPage'
import { HealthDashboard } from '@/pages/admin/HealthDashboard'
import { AuditLogPage } from '@/pages/admin/AuditLogPage'
import { AiModelPage } from '@/pages/admin/AiModelPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />

        {/* Protected shell — guards unauthenticated via AppShell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Candidate */}
          <Route path="/jobs" element={<JobBoardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/interview" element={<InterviewSlotPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Recruiter */}
          <Route path="/jobs/new" element={<JobCreatorPage />} />
          <Route path="/recruiter/rankings" element={<RankingPage />} />
          <Route path="/availability" element={<AvailabilityCalendarPage />} />

          {/* Admin / Super Admin */}
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/health" element={<HealthDashboard />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
          <Route path="/admin/ai-model" element={<AiModelPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
