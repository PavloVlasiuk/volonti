interface Props {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

function buildPages(current: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return range(1, totalPages)
  const out: (number | '…')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(totalPages - 1, current + 1)
  if (left > 2) out.push('…')
  out.push(...range(left, right))
  if (right < totalPages - 1) out.push('…')
  out.push(totalPages)
  return out
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-muted"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="px-2 text-sm text-muted select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              p === page
                ? 'bg-accent text-bg'
                : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-muted"
      >
        →
      </button>
    </nav>
  )
}
