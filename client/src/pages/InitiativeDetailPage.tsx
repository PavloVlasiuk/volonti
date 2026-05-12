import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import InitiativeCard from '../components/InitiativeCard'
import MatchScoreBar from '../components/MatchScoreBar'
import { getInitiative, getInitiatives } from '../api/initiatives.api'
import { submitApplication } from '../api/applications.api'
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

  return (
    <p className="text-sm text-muted leading-relaxed">
      {parts.join(' · ')}
    </p>
  )
}

function ApplyButton({
  initiative,
  hasApplied,
  onApply,
  isPending,
}: {
  initiative: Initiative
  hasApplied: boolean
  onApply: () => void
  isPending: boolean
}) {
  const { isAuthenticated, isVolunteer } = useAuth()
  const navigate = useNavigate()
  const isClosed = initiative.status === 'CLOSED'

  if (isClosed) {
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
    return (
      <button
        disabled
        className="w-full rounded-xl bg-accent/20 py-3 text-sm font-semibold text-accent cursor-not-allowed"
      >
        Заявку подано ✓
      </button>
    )
  }

  return (
    <button
      onClick={onApply}
      disabled={isPending}
      className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isPending ? <Spinner /> : 'Подати заявку'}
    </button>
  )
}

function Sidebar({
  initiative,
  hasApplied,
  onApply,
  isPending,
}: {
  initiative: Initiative
  hasApplied: boolean
  onApply: () => void
  isPending: boolean
}) {
  const isVerified = initiative.organization.status === 'VERIFIED'

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="rounded-xl bg-surface border border-white/[0.06] p-6 flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">{initiative.organization.name}</span>
          <Badge variant="category">НДО</Badge>
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
          onApply={onApply}
          isPending={isPending}
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
  const queryClient = useQueryClient()
  const [hasApplied, setHasApplied] = useState(false)

  const { data: initiative, isLoading, isError } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => getInitiative(id!),
    enabled: !!id,
  })

  const { data: otherInitiatives = [] } = useQuery({
    queryKey: ['initiatives', { organizationId: initiative?.organization.id }],
    queryFn: () => getInitiatives({ organizationId: initiative!.organization.id }),
    enabled: !!initiative,
    select: data => data.filter(i => i.id !== id).slice(0, 3),
  })

  const applyMutation = useMutation({
    mutationFn: () => submitApplication(id!),
    onSuccess: () => {
      setHasApplied(true)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        setHasApplied(true)
      }
    },
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

              {isVolunteer && (
                <div className="mb-8">
                  <MatchScoreBar score={0} label="Збіг з вашим профілем" />
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="lg:sticky lg:top-24">
                <Sidebar
                  initiative={initiative}
                  hasApplied={hasApplied}
                  onApply={() => applyMutation.mutate()}
                  isPending={applyMutation.isPending}
                />
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

      <Footer />
    </div>
  )
}
