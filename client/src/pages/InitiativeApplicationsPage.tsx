import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import ReviewForm from '../components/ReviewForm'
import { getInitiative, getInitiativeApplications } from '../api/initiatives.api'
import { updateApplicationStatus } from '../api/applications.api'
import {
  createReviewFromOrganization,
  getOwnReviewFromOrganization,
} from '../api/reviews.api'
import {
  AvailabilitySlot,
  type Application,
  type ApplicationStatus,
} from '../types/application.types'

const STATUS_BADGE: Record<ApplicationStatus, 'pending' | 'accepted' | 'rejected'> = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'Очікує',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
}

const SLOT_LABEL: Record<AvailabilitySlot, string> = {
  [AvailabilitySlot.WEEKDAYS]: 'Будні',
  [AvailabilitySlot.WEEKENDS]: 'Вихідні',
  [AvailabilitySlot.EVENINGS]: 'Вечори',
  [AvailabilitySlot.FULL_TIME]: 'Повний час',
}

const FORMAT_LABEL: Record<string, string> = {
  REMOTE: 'Дистанційно',
  ON_SITE: 'Офлайн',
  ANY: 'Будь-який',
}

function ApplicationRow({
  app,
  expanded,
  onToggle,
  onAccept,
  onReject,
  isUpdating,
  initiativeCompleted,
  initiativeId,
  onLeaveReview,
}: {
  app: Application
  expanded: boolean
  onToggle: () => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  isUpdating: boolean
  initiativeCompleted: boolean
  initiativeId: string
  onLeaveReview: (app: Application) => void
}) {
  const isDecided = app.status !== 'PENDING'
  const fullName = `${app.volunteer.firstName} ${app.volunteer.lastName}`
  const profile = app.volunteer
  const canReview = initiativeCompleted && app.participated === true

  const { data: ownReview } = useQuery({
    queryKey: ['ownReviewOrg', initiativeId, app.volunteer.id],
    queryFn: () => getOwnReviewFromOrganization(initiativeId, app.volunteer.id),
    enabled: canReview,
  })

  const participationSummary = initiativeCompleted
    ? app.participated === true
      ? `✓ Брав участь · ${(app.hoursLogged ?? 0).toFixed(1)} год`
      : app.participated === false
        ? '✗ Не з\'явився'
        : null
    : null

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white flex items-center gap-2 flex-wrap">
            <span>{fullName}</span>
            {profile.avgRating !== null && (
              <span className="text-xs text-accent font-medium">
                ★ {profile.avgRating.toFixed(1)}
                <span className="text-muted ml-1">
                  · {profile.reviewCount} відгуків
                </span>
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Подано: {new Date(app.createdAt).toLocaleDateString('uk-UA')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {participationSummary && (
            <span className="text-xs font-medium text-accent">
              {participationSummary}
            </span>
          )}

          <Badge variant={STATUS_BADGE[app.status]}>
            {STATUS_LABEL[app.status]}
          </Badge>

          {!isDecided && !initiativeCompleted && (
            <>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAccept(app.id)
                }}
                disabled={isUpdating}
              >
                Прийняти
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(app.id)
                }}
                disabled={isUpdating}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Відхилити
              </Button>
            </>
          )}

          {canReview && !ownReview && (
            <Button
              size="sm"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation()
                onLeaveReview(app)
              }}
            >
              Залишити відгук про волонтера
            </Button>
          )}
          {canReview && ownReview && (
            <span className="text-xs text-muted whitespace-nowrap">
              Відгук: ★ {ownReview.rating}
            </span>
          )}

          <span className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ⌄
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Профіль волонтера
            </p>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-muted">Вік:</dt>
                <dd className="text-white">{profile.age ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-muted">Місто:</dt>
                <dd className="text-white">{profile.city ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-muted">Формат:</dt>
                <dd className="text-white">
                  {FORMAT_LABEL[profile.formatPreference] ?? profile.formatPreference}
                </dd>
              </div>
              {profile.interests.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <dt className="text-muted">Інтереси:</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <span
                        key={i.id}
                        className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs text-accent"
                      >
                        {i.name}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {profile.bio && (
                <div className="flex flex-col gap-1 mt-1">
                  <dt className="text-muted">Про себе:</dt>
                  <dd className="text-white/80 leading-relaxed">{profile.bio}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Заявка
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted mb-1">Мотивація</p>
                <p className="text-white/80 whitespace-pre-line">
                  {app.motivation || '—'}
                </p>
              </div>
              {app.availability.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1">Доступність</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.availability.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white"
                      >
                        {SLOT_LABEL[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {app.contactPhone && (
                <div>
                  <p className="text-xs text-muted mb-1">Телефон</p>
                  <p className="text-white">{app.contactPhone}</p>
                </div>
              )}
              {app.experience && (
                <div>
                  <p className="text-xs text-muted mb-1">Досвід</p>
                  <p className="text-white/80 whitespace-pre-line">
                    {app.experience}
                  </p>
                </div>
              )}
              {(app.hasTransport || app.canStartImmediately) && (
                <div className="flex flex-col gap-1 text-white/80">
                  {app.hasTransport && <span>✓ Має власний транспорт</span>}
                  {app.canStartImmediately && <span>✓ Готовий долучитися негайно</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function ReviewModal({
  initiativeId,
  app,
  onClose,
}: {
  initiativeId: string
  app: Application
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      createReviewFromOrganization(initiativeId, {
        ...payload,
        targetId: app.volunteer.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ownReviewOrg', initiativeId, app.volunteer.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['initiative-applications', initiativeId],
      })
      onClose()
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      if (err.response?.status === 409) {
        setError('Ви вже залишили відгук про цього волонтера')
      } else {
        setError(err.response?.data?.message ?? 'Не вдалося надіслати відгук')
      }
    },
  })

  const fullName = `${app.volunteer.firstName} ${app.volunteer.lastName}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface border border-white/[0.08] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-muted mb-1">Відгук про волонтера</p>
        <p className="text-base font-semibold text-white mb-4">{fullName}</p>
        <ReviewForm
          onSubmit={(payload) => mutation.mutate(payload)}
          onCancel={onClose}
          submitting={mutation.isPending}
          error={error}
        />
      </div>
    </div>
  )
}

export default function InitiativeApplicationsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [reviewing, setReviewing] = useState<Application | null>(null)

  const { data: initiative, isLoading: loadingInit } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => getInitiative(id!),
    enabled: !!id,
  })

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['initiative-applications', id],
    queryFn: () => getInitiativeApplications(id!),
    enabled: !!id,
  })

  const firstPendingId = useMemo(
    () =>
      initiative?.status === 'COMPLETED'
        ? undefined
        : applications.find((a) => a.status === 'PENDING')?.id,
    [applications, initiative?.status]
  )

  useEffect(() => {
    if (firstPendingId) {
      setExpandedIds((prev) => {
        if (prev.has(firstPendingId)) return prev
        const next = new Set(prev)
        next.add(firstPendingId)
        return next
      })
    }
  }, [firstPendingId])

  function toggle(appId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(appId)) next.delete(appId)
      else next.add(appId)
      return next
    })
  }

  const updateMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initiative-applications', id] })
      queryClient.invalidateQueries({ queryKey: ['initiative', id] })
    },
  })

  const isLoading = loadingInit || loadingApps

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
            <Link to="/dashboard" className="hover:text-accent transition-colors">
              Дашборд
            </Link>
            <span>→</span>
            <span className="text-white/70 line-clamp-1 max-w-xs">
              {initiative?.title ?? '...'}
            </span>
          </nav>

          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold text-white line-clamp-2">
              {initiative?.title ?? 'Заявки'}
            </h1>
            {applications.length > 0 && (
              <span className="shrink-0 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
                {applications.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">Заявок ще немає</p>
              <p className="text-sm text-muted max-w-xs">
                Волонтери ще не подавали заявки на цю ініціативу.
              </p>
              <Link
                to="/dashboard"
                className="mt-2 text-sm font-medium text-accent hover:underline"
              >
                ← До дашборду
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map(app => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  expanded={expandedIds.has(app.id)}
                  onToggle={() => toggle(app.id)}
                  onAccept={(appId) =>
                    updateMutation.mutate({ appId, status: 'ACCEPTED' })
                  }
                  onReject={(appId) =>
                    updateMutation.mutate({ appId, status: 'REJECTED' })
                  }
                  isUpdating={updateMutation.isPending}
                  initiativeCompleted={initiative?.status === 'COMPLETED'}
                  initiativeId={id!}
                  onLeaveReview={setReviewing}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {reviewing && id && (
        <ReviewModal
          initiativeId={id}
          app={reviewing}
          onClose={() => setReviewing(null)}
        />
      )}

      <Footer />
    </div>
  )
}
