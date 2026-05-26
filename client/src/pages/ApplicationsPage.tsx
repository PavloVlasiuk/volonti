import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import ReviewForm from '../components/ReviewForm'
import { getMyApplications, downloadCertificate } from '../api/applications.api'
import {
  createReviewFromVolunteer,
  getOwnReviewFromVolunteer,
} from '../api/reviews.api'
import { formatDate } from '../utils/formatDate'
import type { Application, ApplicationStatus } from '../types/application.types'

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

function ApplicationRow({
  app,
  onLeaveReview,
}: {
  app: Application
  onLeaveReview: (app: Application) => void
}) {
  const isCompleted = Boolean(app.completedAt)
  const showCertificate = isCompleted && app.participated === true

  const { data: ownReview } = useQuery({
    queryKey: ['ownReview', app.initiative.id],
    queryFn: () => getOwnReviewFromVolunteer(app.initiative.id),
    enabled: showCertificate,
  })

  return (
    <div className="rounded-xl bg-surface border border-white/[0.06] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-white leading-snug line-clamp-1">
          {app.initiative.title}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          <Link
            to={`/organizations/${app.initiative.organization.id}`}
            className="hover:text-accent transition-colors"
          >
            {app.initiative.organization.name}
          </Link>
          {' · '}
          {formatDate(app.createdAt)}
        </p>
        {showCertificate && (
          <p className="mt-1 text-xs text-accent">
            ✓ Завершено · {(app.hoursLogged ?? 0).toFixed(1)} год
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <Badge variant={STATUS_BADGE[app.status]}>
          {STATUS_LABEL[app.status]}
        </Badge>
        {showCertificate && !ownReview && (
          <button
            onClick={() => onLeaveReview(app)}
            className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
          >
            Залишити відгук
          </button>
        )}
        {showCertificate && ownReview && (
          <span className="text-xs text-muted whitespace-nowrap">
            Відгук залишено · ★ {ownReview.rating}
          </span>
        )}
        {showCertificate && (
          <button
            onClick={() => downloadCertificate(app.id)}
            className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
          >
            Сертифікат ↓
          </button>
        )}
        <Link
          to={`/initiatives/${app.initiative.id}`}
          className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
        >
          Переглянути →
        </Link>
      </div>
    </div>
  )
}

function ReviewModal({
  app,
  onClose,
}: {
  app: Application
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      createReviewFromVolunteer(app.initiative.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownReview', app.initiative.id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose()
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      if (err.response?.status === 409) {
        setError('Ви вже залишили відгук про цю ініціативу')
      } else {
        setError(err.response?.data?.message ?? 'Не вдалося надіслати відгук')
      }
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface border border-white/[0.08] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-muted mb-1">Відгук про</p>
        <p className="text-base font-semibold text-white mb-4">
          {app.initiative.organization.name}
        </p>
        <ReviewForm
          title={`«${app.initiative.title}»`}
          onSubmit={(payload) => mutation.mutate(payload)}
          onCancel={onClose}
          submitting={mutation.isPending}
          error={error}
        />
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [reviewing, setReviewing] = useState<Application | null>(null)

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getMyApplications,
  })

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <h1 className="mb-8 text-3xl font-bold text-white">Мої заявки</h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">Заявок ще немає</p>
              <p className="text-sm text-muted max-w-xs">
                Подайте заявку на ініціативу, що вас цікавить, і вона з'явиться тут.
              </p>
              <Link
                to="/initiatives"
                className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
              >
                Переглянути ініціативи
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map(app => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  onLeaveReview={setReviewing}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {reviewing && (
        <ReviewModal app={reviewing} onClose={() => setReviewing(null)} />
      )}

      <Footer />
    </div>
  )
}
