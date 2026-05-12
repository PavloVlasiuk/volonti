import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed'

const variants = {
  filled: 'bg-accent text-bg hover:bg-accent/90',
  outlined: 'border border-accent text-accent hover:bg-accent/10',
  ghost: 'text-accent hover:bg-accent/10',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({
  variant = 'filled',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
