import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...rest }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl bg-surface border ${error ? 'border-red-500' : 'border-white/[0.08]'} px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
