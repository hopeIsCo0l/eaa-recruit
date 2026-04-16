import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const variantClass: Record<string, string> = {
    default: 'bg-card border-border',
    success: 'bg-green-900 border-green-700',
    error:   'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg text-foreground',
            variantClass[t.variant ?? 'default']
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
            )}
          </div>
          <X className="h-4 w-4 shrink-0 opacity-70 cursor-pointer" />
        </div>
      ))}
    </div>
  )
}
