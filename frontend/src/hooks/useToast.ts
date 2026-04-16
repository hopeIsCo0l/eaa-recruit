import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

let toastQueue: ((toast: Toast) => void) | null = null

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: Toast = { ...t, id }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  toastQueue = toast

  return { toasts, toast }
}

/** Call this outside React components (e.g., Axios interceptor). */
export function showToast(t: Omit<Toast, 'id'>) {
  toastQueue?.(t)
}
