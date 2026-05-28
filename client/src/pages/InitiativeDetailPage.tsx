import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import InitiativeCard from '../components/InitiativeCard'
import MatchScoreBar from '../components/MatchScoreBar'
import ApplicationFormModal from '../components/ApplicationFormModal'
import { getInitiative, getInitiatives } from '../api/initiatives.api'
import { getInitiativeMatch } from '../api/profile.api'
import { getOwnApplicationForInitiative } from '../api/applications.api'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatDate'
import type { Initiative } from '../types/initiative.types'

const TYPE_BADGE: Record<string, { variant: 'urgent' | 'regular' | 'ongoing'; label: string }> = {
  URGENT: { variant: 'urgent', label: 'ТЕРМІНОВА' },
  PLANNED: { variant: 'regular', label: 'ПЛАНОВА' },
  ONGOING: { variant: 'ongoing', label: 'ПОСТІЙНА' },
}

const FORMAT_LABEL: Record<string, string> = {
  REMOTE: 'Онлайн',
  ON_SITE: 'Офлайн',
}

function MetaRow({ initiative }: { initiative: Initiative }) {
  const parts: string[] = []
  if (initiative.city) parts.push(initiative.city)
  parts.push(FORMAT_LABEL[initiative.format] ?? initiative.format)
  if (initiative.startsAt || initiative.endsAt) {
    parts.push(`${formatDate(initiative.startsAt ?? undefined)} — ${formatDate(initiative.endsAt ?? undefined)}`)
  }
  if (initiative.minAge) parts.push(`Від ${initiative.minAge} років`)
  if (initiative.slotsNeeded != null) {
    parts.push(`${initiative.acceptedCount} / ${initiative.slotsNeeded} заявок прийнято`)
  }

  return (
    <p className="text-sm text-muted leading-relaxed">
      {parts.join(' · ')}
    </p>
  )
}

function ApplyButton({
  initiative,
  hasApplied,
  applicationStatus,
  onApply,
}: {
  initiative: Initiative
  hasApplied: boolean
  applicationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
  onApply: () => void
}) {
  const { isAuthenticated, isVolunteer } = useAuth()
  const navigate = useNavigate()
  const isInactive =
    initiative.status === 'CLOSED' || initiative.status === 'COMPLETED'

  if (isInactive) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-muted cursor-not-allowed"
      >
        Ініціатива завершена
      </button>
    )
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
      >
        Подати заявку
      </button>
    )
  }

  if (!isVolunteer) {
    return null
  }

  if (hasApplied) {
    const label =
      applicationStatus === 'ACCEPTED'
        ? 'Заявку прийнято ✓'
        : applicationStatus === 'REJECTED'
          ? 'Заявку відхилено'
          : 'Заявку подано ✓'
    return (
      <button
        disabled
        className="w-full rounded-xl bg-accent/20 py-3 text-sm font-semibold text-accent cursor-not-allowed"
      >
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={onApply}
      className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
    >
      Подати заявку
    </button>
  )
}

function Sidebar({
  initiative,
  hasApplied,
  applicationStatus,
  onApply,
}: {
  initiative: Initiative
  hasApplied: boolean
  applicationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
  onApply: () => void
}) {
  const isVerified = initiative.organization.status === 'VERIFIED'

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="rounded-xl bg-surface border border-white/[0.06] p-6 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Link
            to={`/organizations/${initiative.organization.id}`}
            className="font-semibold text-white hover:text-accent transition-colors"
          >
            {initiative.organization.name}
          </Link>
          <Badge variant="category">НДО</Badge>
          {initiative.organization.avgRating !== null && (
            <span className="text-xs text-accent font-medium">
              ★ {initiative.organization.avgRating.toFixed(1)}
              <span className="text-muted ml-1">
                · {initiative.organization.reviewCount} відгуків
              </span>
            </span>
          )}
        </div>
        {isVerified && (
          <p className="text-xs font-medium text-accent">✓ Верифікована організація</p>
        )}
      </div>

      <div className="border-t border-white/[0.06]" />

      <div className="flex flex-col gap-2">
        <ApplyButton
          initiative={initiative}
          hasApplied={hasApplied}
          applicationStatus={applicationStatus}
          onApply={onApply}
        />
        <p className="text-center text-xs text-muted">
          Реакція організації — протягом кількох днів
        </p>
      </div>

      <div className="border-t border-white/[0.06]" />

      <div className="flex gap-4">
        <button
          onClick={copyLink}
          className="text-xs text-muted hover:text-white transition-colors"
        >
          Копіювати посилання
        </button>
      </div>
    </div>
  )
}

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isVolunteer } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [alreadyAppliedBanner, setAlreadyAppliedBanner] = useState(false)

  const { data: initiative, isLoading, isError } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => getInitiative(id!),
    enabled: !!id,
  })

  const { data: ownApplication } = useQuery({
    queryKey: ['ownApplication', id],
    queryFn: () => getOwnApplicationForInitiative(id!),
    enabled: !!id && isVolunteer,
  })

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getInitiativeMatch(id!),
    enabled: !!id && isVolunteer,
  })

  const { data: otherInitiatives = [] } = useQuery({
    queryKey: ['initiatives', { organizationId: initiative?.organization.id }],
    queryFn: () =>
      getInitiatives({
        organizationId: initiative!.organization.id,
        page: 1,
        limit: 6,
      }),
    enabled: !!initiative,
    select: data => data.items.filter(i => i.id !== id).slice(0, 3),
  })

  const hasApplied = !!ownApplication
  const applicationStatus = ownApplication?.status ?? null

  function handleApplied() {
    setShowModal(false)
  }

  function handleAlreadyApplied() {
    setShowModal(false)
    setAlreadyAppliedBanner(true)
  }

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

  if (isError || !initiative) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-white text-lg">Ініціативу не знайдено</p>
          <Link to="/initiatives" className="text-sm text-accent hover:underline">
            ← Повернутись до ініціатив
          </Link>
        </main>
      </div>
    )
  }

  const typeBadge = TYPE_BADGE[initiative.type] ?? TYPE_BADGE.PLANNED
  const requirements = initiative.requirements
    ?.split('\n')
    .map(r => r.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
            <Link to="/initiatives" className="hover:text-accent transition-colors">
              Ініціативи
            </Link>
            <span>→</span>
            <span className="text-white/70 line-clamp-1 max-w-xs">{initiative.title}</span>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                <Badge variant="category">{initiative.categoryName}</Badge>
              </div>

              <h1 className="text-3xl font-bold text-white leading-tight mb-4 sm:text-4xl">
                {initiative.title}
              </h1>

              <div className="mb-8">
                <MetaRow initiative={initiative} />
              </div>

              <div className="mb-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                  Про ініціативу
                </p>
                <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
                  {initiative.description}
                </p>
              </div>

              {requirements && requirements.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                    Вимоги до волонтерів
                  </p>
                  <ul className="space-y-2">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-accent mt-0.5 shrink-0">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isVolunteer && match && (
                <div className="mb-8">
                  <MatchScoreBar
                    score={match.matchScore}
                    label="Збіг з вашим профілем"
                  />
                  {match.reasons.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {match.reasons.map((r) => (
                        <li
                          key={r}
                          className="rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs text-accent"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="lg:sticky lg:top-24">
                <Sidebar
                  initiative={initiative}
                  hasApplied={hasApplied}
                  applicationStatus={applicationStatus}
                  onApply={() => setShowModal(true)}
                />
                {alreadyAppliedBanner && (
                  <p className="mt-3 text-center text-xs text-accent">
                    Заявку вже подано
                  </p>
                )}
              </div>
            </div>
          </div>

          {otherInitiatives.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-xl font-bold text-white">
                Інші ініціативи організації
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-2">
                {otherInitiatives.map(i => (
                  <div key={i.id} className="w-64 shrink-0">
                    <InitiativeCard initiative={i} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ApplicationFormModal
          initiative={initiative}
          onClose={() => setShowModal(false)}
          onSuccess={handleApplied}
          onAlreadyApplied={handleAlreadyApplied}
        />
      )}

      <Footer />
    </div>
  )
}
