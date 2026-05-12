import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InitiativeCard from '../components/InitiativeCard'
import Spinner from '../components/Spinner'
import { getFeed } from '../api/profile.api'
import { getCategories } from '../api/categories.api'
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

export default function FeedPage() {
  const [city, setCity] = useState('')
  const [format, setFormat] = useState<FormatType | ''>('')
  const [type, setType] = useState<InitiativeType | ''>('')
  const [categoryId, setCategoryId] = useState('')

  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const hasNoInterests = feedItems.length > 0 && feedItems.every(f => f.matchScore === 0)

  const filtered = useMemo(() => {
    return feedItems.filter((item) => {
      if (city && !item.city?.toLowerCase().includes(city.toLowerCase())) return false
      if (format && item.format !== format) return false
      if (type && item.type !== type) return false
      if (categoryId && item.categoryId !== categoryId) return false
      return true
    })
  }, [feedItems, city, format, type, categoryId])

  const hasActiveFilters = !!(city || format || type || categoryId)

  function resetFilters() {
    setCity('')
    setFormat('')
    setType('')
    setCategoryId('')
  }

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Стрічка
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Ваша стрічка</h1>
            <p className="mt-2 text-sm text-muted">Підібрано за вашим профілем та інтересами</p>
          </div>

          {/* Incomplete profile banner */}
          {hasNoInterests && (
            <div className="mb-6 rounded-xl bg-accent/10 border border-accent/20 px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-sm text-white/80">
                Заповніть профіль, щоб бачити персоналізовані результати
              </p>
              <Link
                to="/profile"
                className="shrink-0 text-sm font-semibold text-accent hover:underline"
              >
                До профілю →
              </Link>
            </div>
          )}

          {/* Filter bar */}
          <div className="mb-8 rounded-xl bg-surface border border-white/[0.06] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="Місто..."
                value={city}
                onChange={e => setCity(e.target.value)}
                className="rounded-lg bg-bg border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 w-36"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Формат</span>
                <div className="flex gap-1">
                  {FORMAT_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={format === opt.value}
                      onClick={() => setFormat(opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Тип</span>
                <div className="flex gap-1">
                  {TYPE_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={type === opt.value}
                      onClick={() => setType(opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {categories.length > 0 && (
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="rounded-lg bg-bg border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50"
                >
                  <option value="">Категорія</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">Ініціативи не знайдено</p>
              <p className="text-sm text-muted max-w-xs">
                {hasActiveFilters
                  ? 'Спробуйте змінити або скинути фільтри.'
                  : 'На жаль, наразі немає ініціатив, що відповідають вашому профілю.'}
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <InitiativeCard
                  key={item.id}
                  initiative={item}
                  matchScore={item.matchScore}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
