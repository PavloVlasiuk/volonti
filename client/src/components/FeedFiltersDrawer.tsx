import type { Category } from '../types/category.types'
import type { FormatType, InitiativeType } from '../types/initiative.types'

const FORMAT_OPTIONS: { label: string; value: FormatType | '' }[] = [
  { label: 'Усі', value: '' },
  { label: 'Онлайн', value: 'REMOTE' },
  { label: 'Офлайн', value: 'ON_SITE' },
]

const TYPE_OPTIONS: { label: string; value: InitiativeType | '' }[] = [
  { label: 'Усі', value: '' },
  { label: 'Термінові', value: 'URGENT' },
  { label: 'Планові', value: 'PLANNED' },
  { label: 'Постійні', value: 'ONGOING' },
]

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-accent text-bg'
          : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

interface Props {
  city: string
  format: FormatType | ''
  type: InitiativeType | ''
  categoryId: string
  categories: Category[]
  hasActiveFilters: boolean
  onChange: (key: string, value: string) => void
  onReset: () => void
}

export default function FeedFiltersDrawer({
  city,
  format,
  type,
  categoryId,
  categories,
  hasActiveFilters,
  onChange,
  onReset,
}: Props) {
  return (
    <details
      open={hasActiveFilters}
      className="mb-8 rounded-xl bg-surface border border-white/[0.06] [&[open]>summary>span:last-child]:rotate-180"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm text-white/80 hover:text-white">
        <span className="flex items-center gap-2">
          <span className="text-accent">⌕</span>
          Звузити пошук
          {hasActiveFilters && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
              активні
            </span>
          )}
        </span>
        <span className="inline-block text-muted transition-transform">▾</span>
      </summary>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Місто..."
            value={city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-36 rounded-lg border border-white/10 bg-bg px-3 py-1.5 text-sm text-white placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Формат</span>
            <div className="flex gap-1">
              {FORMAT_OPTIONS.map((opt) => (
                <TogglePill
                  key={opt.value}
                  active={format === opt.value}
                  onClick={() => onChange('format', opt.value)}
                >
                  {opt.label}
                </TogglePill>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Тип</span>
            <div className="flex gap-1">
              {TYPE_OPTIONS.map((opt) => (
                <TogglePill
                  key={opt.value}
                  active={type === opt.value}
                  onClick={() => onChange('type', opt.value)}
                >
                  {opt.label}
                </TogglePill>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <select
              value={categoryId}
              onChange={(e) => onChange('categoryId', e.target.value)}
              className="rounded-lg border border-white/10 bg-bg px-3 py-1.5 text-sm text-white focus:border-accent/50 focus:outline-none"
            >
              <option value="">Категорія</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="ml-auto text-xs font-medium text-accent hover:underline"
            >
              Скинути фільтри
            </button>
          )}
        </div>
      </div>
    </details>
  )
}
