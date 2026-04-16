import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthStore, AuthUser } from '@/types/auth'

/**
 * FR-80: Zustand auth store.
 * Persists token + user to localStorage via the persist middleware.
 * All components accessing auth state must use this hook.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      token:           null,
      user:            null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────────

      /** Called after a successful login response. */
      login: (token: string, user: AuthUser) =>
        set({ token, user, isAuthenticated: true }),

      /** Clears all auth state (logout / token expired). */
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      /** Refresh the token without changing user details (for silent refresh). */
      setToken: (token: string) =>
        set({ token, isAuthenticated: true }),
    }),
    {
      name:    'eaa-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields; functions are excluded automatically
      partialize: (state) => ({
        token:           state.token,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
