import { useEffect, useRef } from 'react'
import { Bold, Italic, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isMounted.current) {
      editorRef.current.innerHTML = value
      isMounted.current = true
    }
  }, [])

  const exec = (command: string) => {
    document.execCommand(command, false)
    editorRef.current?.focus()
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div className={cn('border border-border rounded-md overflow-hidden', className)}>
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-secondary/30">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('bold') }}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('italic') }}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }}
          className="p-1.5 rounded hover:bg-secondary transition-colors"
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML) }}
        data-placeholder={placeholder}
        className="min-h-[120px] p-3 text-sm text-foreground outline-none prose prose-invert max-w-none
          [&_ul]:list-disc [&_ul]:pl-5 [&_b]:font-bold [&_i]:italic
          before:text-muted-foreground before:pointer-events-none
          empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
