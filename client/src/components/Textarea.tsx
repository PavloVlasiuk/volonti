import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, id, className = '', ...rest }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-white">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-xl bg-surface border ${error ? 'border-red-500' : 'border-white/[0.08]'} px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none ${className}`}
        rows={4}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
