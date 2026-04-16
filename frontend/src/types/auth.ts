export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN'

export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: UserRole
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
}

export interface AuthActions {
  login: (token: string, user: AuthUser) => void
  logout: () => void
  setToken: (token: string) => void
}

export type AuthStore = AuthState & AuthActions
