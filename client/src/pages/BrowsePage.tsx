import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InitiativeCard from '../components/InitiativeCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import { getInitiatives } from '../api/initiatives.api'
import { getCategories } from '../api/categories.api'
import type { FormatType, InitiativeType } from '../types/initiative.types'

const PAGE_SIZE = 12

const FILTER_KEYS = ['city', 'format', 'type', 'categoryId'] as const

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

export default function BrowsePage() {
  const [params, setParams] = useSearchParams()

  const city = params.get('city') ?? ''
  const format = (params.get('format') ?? '') as FormatType | ''
  const type = (params.get('type') ?? '') as InitiativeType | ''
  const categoryId = params.get('categoryId') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  function setFilter(key: string, value: string) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function setPage(p: number) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (p <= 1) next.delete('page')
      else next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFilters() {
    setParams({})
  }

  const hasActiveFilters = FILTER_KEYS.some(k => params.get(k))

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const filters = {
    ...(city && { city }),
    ...(format && { format }),
    ...(type && { type }),
    ...(categoryId && { category: categoryId }),
    page,
    limit: PAGE_SIZE,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['initiatives', filters],
    queryFn: () => getInitiatives(filters),
  })
  const initiatives = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Ініціативи
            </p>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Актуальні ініціативи</h1>
              {!isLoading && (
                <span className="text-sm text-muted">{total} результатів</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">
              Перегляньте відкриті ініціативи або скористайтесь фільтрами.
            </p>
          </div>

          {/* Filter bar */}
          <div className="mb-8 rounded-xl bg-surface border border-white/[0.06] p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* City */}
              <input
                type="text"
                placeholder="Місто..."
                value={city}
                onChange={e => setFilter('city', e.target.value)}
                className="rounded-lg bg-bg border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 w-36"
              />

              {/* Format */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Формат</span>
                <div className="flex gap-1">
                  {FORMAT_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={format === opt.value}
                      onClick={() => setFilter('format', opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Тип</span>
                <div className="flex gap-1">
                  {TYPE_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={type === opt.value}
                      onClick={() => setFilter('type', opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <select
                  value={categoryId}
                  onChange={e => setFilter('categoryId', e.target.value)}
                  className="rounded-lg bg-bg border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50"
                >
                  <option value="">Категорія</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-auto text-xs font-medium text-accent hover:underline"
                >
                  Скинути фільтри
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : initiatives.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">Ініціативи не знайдено</p>
              <p className="text-sm text-muted max-w-xs">
                Спробуйте змінити фільтри або скиньте їх, щоб побачити всі доступні ініціативи.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
                >
                  Скинути фільтри
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {initiatives.map(initiative => (
                  <InitiativeCard
                    key={initiative.id}
                    initiative={initiative}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                limit={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
