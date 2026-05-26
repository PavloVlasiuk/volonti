import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import StarRating from '../components/StarRating'
import InitiativeCard from '../components/InitiativeCard'
import { getOrganizationPublic } from '../api/organizations.api'
import { formatDate } from '../utils/formatDate'
import type { OrgType } from '../types/organization.types'
import type { Review } from '../types/review.types'

const ORG_TYPE_LABEL: Record<OrgType, string> = {
  NGO: 'НГО',
  CHARITY: 'Благодійний фонд',
  MUNICIPAL: 'Муніципальна',
  CRISIS_CENTER: 'Кризовий центр',
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <Card className="p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <StarRating value={review.rating} size="sm" readOnly />
          <span className="text-sm font-semibold text-white truncate">
            {review.authorName || 'Анонім'}
          </span>
        </div>
        <span className="text-xs text-muted shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm text-white/80 whitespace-pre-line">
          {review.comment}
        </p>
      )}
    </Card>
  )
}

export default function OrgPublicPage() {
  const { id } = useParams<{ id: string }>()

  const { data: org, isLoading, isError } = useQuery({
    queryKey: ['org-public', id],
    queryFn: () => getOrganizationPublic(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <Spinner />
        </main>
      </div>
    )
  }

  if (isError || !org) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-white text-lg">Організацію не знайдено</p>
          <Link to="/initiatives" className="text-sm text-accent hover:underline">
            ← Повернутись до ініціатив
          </Link>
        </main>
      </div>
    )
  }

  const isVerified = org.status === 'VERIFIED'

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <section className="rounded-xl bg-surface border border-white/[0.06] p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="category">{ORG_TYPE_LABEL[org.type]}</Badge>
              {isVerified && (
                <Badge variant="verified">✓ Верифікована</Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {org.name}
            </h1>
            {org.reviewCount > 0 && org.avgRating !== null && (
              <div className="flex items-center gap-2">
                <StarRating value={org.avgRating} size="md" readOnly />
                <span className="text-sm font-medium text-white">
                  {org.avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted">
                  · {org.reviewCount} відгуків
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted">Контактна особа</span>
                <span className="text-sm text-white">{org.contactPerson}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted">На платформі з</span>
                <span className="text-sm text-white">
                  {formatDate(org.createdAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="mb-5 text-xl font-bold text-white">
              Активні ініціативи
              <span className="ml-2 text-sm font-normal text-muted">
                {org.activeInitiatives.length}
              </span>
            </h2>
            {org.activeInitiatives.length === 0 ? (
              <p className="text-sm text-muted">Поки що немає активних ініціатив.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {org.activeInitiatives.map((i) => (
                  <InitiativeCard key={i.id} initiative={i} />
                ))}
              </div>
            )}
          </section>

          {org.completedInitiatives.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-xl font-bold text-white">
                Завершені ініціативи
                <span className="ml-2 text-sm font-normal text-muted">
                  {org.completedInitiatives.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {org.completedInitiatives.map((i) => (
                  <InitiativeCard key={i.id} initiative={i} compact />
                ))}
              </div>
            </section>
          )}

          {org.recentReviews.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-5 text-xl font-bold text-white">Останні відгуки</h2>
              <div className="flex flex-col gap-3">
                {org.recentReviews.map((r) => (
                  <ReviewRow key={r.id} review={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
