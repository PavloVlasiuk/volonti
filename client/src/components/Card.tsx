import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className = '', ...rest }: Props) {
  return (
    <div
      className={`bg-surface border border-white/[0.08] rounded-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
