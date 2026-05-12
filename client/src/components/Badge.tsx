import type { ReactNode } from 'react'

type Variant =
  | 'urgent'
  | 'regular'
  | 'ongoing'
  | 'active'
  | 'closed'
  | 'accepted'
  | 'rejected'
  | 'pending'
  | 'verified'
  | 'category'

interface Props {
  variant: Variant
  children: ReactNode
  className?: string
}

const styles: Record<Variant, string> = {
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/20',
  regular: 'bg-accent/10 text-accent border border-accent/20',
  ongoing: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  active: 'bg-accent/10 text-accent border border-accent/20',
  closed: 'bg-white/5 text-muted border border-white/10',
  accepted: 'bg-accent/10 text-accent border border-accent/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  pending: 'bg-white/5 text-muted border border-white/10',
  verified: 'bg-accent/10 text-accent border border-accent/20',
  category: 'bg-white/5 text-muted border border-white/10',
}

export default function Badge({ variant, children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
