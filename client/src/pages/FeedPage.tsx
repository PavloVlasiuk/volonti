import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InitiativeCard from '../components/InitiativeCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import PersonalizationStrip from '../components/PersonalizationStrip'
import ProfileSetupStrip from '../components/ProfileSetupStrip'
import FeedFiltersDrawer from '../components/FeedFiltersDrawer'
import { getFeed, getProfile } from '../api/profile.api'
import { getCategories } from '../api/categories.api'
import type { FeedItem, FormatType, InitiativeType } from '../types/initiative.types'

const PAGE_SIZE = 12
const TOP_THRESHOLD = 70
const MID_THRESHOLD = 40
const FILTER_KEYS = ['city', 'format', 'type', 'categoryId'] as const

interface SectionProps {
  title: string
  subtitle?: string
  items: FeedItem[]
  layout: 'hero' | 'feed' | 'rest'
}

function FeedSection({ title, subtitle, items, layout }: SectionProps) {
  if (items.length === 0) return null

  if (layout === 'hero') {
    const [first, ...next] = items
    return (
      <section className="mb-10">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <InitiativeCard
            initiative={first}
            matchScore={first.matchScore}
            reasons={first.reasons}
            variant="hero"
            dismissible
          />
          {next.length > 0 && (
            <div className="flex flex-col gap-5">
              {next.map((item) => (
                <InitiativeCard
                  key={item.id}
                  initiative={item}
                  matchScore={item.matchScore}
                  reasons={item.reasons}
                  variant="feed"
                  dismissible
                />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  if (layout === 'feed') {
    return (
      <section className="mb-10">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <InitiativeCard
              key={item.id}
              initiative={item}
              matchScore={item.matchScore}
              reasons={item.reasons}
              variant="feed"
              dismissible
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <InitiativeCard
            key={item.id}
            initiative={item}
            matchScore={item.matchScore}
            reasons={item.reasons}
            compact
            dismissible
          />
        ))}
      </div>
    </section>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-muted">· {subtitle}</p>}
    </div>
  )
}

export default function FeedPage() {
  const [params, setParams] = useSearchParams()

  const city = params.get('city') ?? ''
  const format = (params.get('format') ?? '') as FormatType | ''
  const type = (params.get('type') ?? '') as InitiativeType | ''
  const categoryId = params.get('categoryId') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  function setFilter(key: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function setPage(p: number) {
    setParams((prev) => {
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

  const hasActiveFilters = FILTER_KEYS.some((k) => params.get(k))

  const query = {
    ...(city && { city }),
    ...(format && { format }),
    ...(type && { type }),
    ...(categoryId && { category: categoryId }),
    page,
    limit: PAGE_SIZE,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['feed', query],
    queryFn: () => getFeed(query),
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const feedItems = data?.items ?? []
  const total = data?.total ?? 0

  // A freshly registered volunteer has no interests yet, so the matching
  // algorithm has nothing to build on and the feed falls back to recency.
  // Prompt them to complete the profile instead of pretending it's personalized.
  const profileNeedsSetup = !!profile && (profile.interests?.length ?? 0) === 0

  const hasPersonalization =
    !!profile &&
    ((profile.interests?.length ?? 0) > 0 ||
      !!profile.city ||
      (profile.formatPreference && profile.formatPreference !== 'ANY'))

  const top = feedItems.filter((i) => i.matchScore >= TOP_THRESHOLD)
  const mid = feedItems.filter(
    (i) => i.matchScore >= MID_THRESHOLD && i.matchScore < TOP_THRESHOLD,
  )
  const rest = feedItems.filter((i) => i.matchScore < MID_THRESHOLD)

  // Fallback: if scores don't differentiate items, render a flat grid so the
  // page still looks intentional instead of dumping everything as "rest".
  const useFallbackGrid = top.length === 0 && mid.length === 0

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Стрічка
            </p>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Ваша стрічка
              </h1>
              {!isLoading && (
                <span className="text-sm text-muted">{total} результатів</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">
              {profileNeedsSetup
                ? 'Поки що сортуємо за новизною — заповніть профіль для персоналізації'
                : 'Підібрано за вашим профілем та інтересами'}
            </p>
          </div>

          {profileNeedsSetup ? (
            <ProfileSetupStrip />
          ) : (
            hasPersonalization && <PersonalizationStrip profile={profile} />
          )}

          <FeedFiltersDrawer
            city={city}
            format={format}
            type={type}
            categoryId={categoryId}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
            onChange={setFilter}
            onReset={resetFilters}
          />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : feedItems.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">
                Ініціативи не знайдено
              </p>
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
          ) : profileNeedsSetup ? (
            // No interests yet → nothing to rank on. Show a plain recency grid
            // without match scores or "Топ збігів"-style sections, so the page
            // doesn't pretend the order is personalized.
            <>
              <SectionHeader
                title="Нові ініціативи"
                subtitle="Найсвіжіші можливості"
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {feedItems.map((item) => (
                  <InitiativeCard key={item.id} initiative={item} dismissible />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                limit={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          ) : useFallbackGrid ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {feedItems.map((item) => (
                  <InitiativeCard
                    key={item.id}
                    initiative={item}
                    matchScore={item.matchScore}
                    reasons={item.reasons}
                    dismissible
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
          ) : (
            <>
              <FeedSection
                title="Топ збігів"
                subtitle="Найкраще пасує до вашого профілю"
                items={top.slice(0, 5)}
                layout="hero"
              />
              <FeedSection
                title="Може зацікавити"
                subtitle="Близькі до ваших інтересів"
                items={mid}
                layout="feed"
              />
              <FeedSection
                title="Інші ідеї"
                subtitle="Можливо, варто спробувати щось нове"
                items={[...top.slice(5), ...rest]}
                layout="rest"
              />
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
