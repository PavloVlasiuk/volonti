import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { getMyApplications, downloadCertificate } from '../api/applications.api'
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

function ApplicationRow({ app }: { app: Application }) {
  const isCompleted = app.initiative
    ? Boolean(app.completedAt)
    : false
  const showCertificate = isCompleted && app.participated === true

  return (
    <div className="rounded-xl bg-surface border border-white/[0.06] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-white leading-snug line-clamp-1">
          {app.initiative.title}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {app.initiative.organization.name} · {formatDate(app.createdAt)}
        </p>
        {showCertificate && (
          <p className="mt-1 text-xs text-accent">
            ✓ Завершено · {(app.hoursLogged ?? 0).toFixed(1)} год
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Badge variant={STATUS_BADGE[app.status]}>
          {STATUS_LABEL[app.status]}
        </Badge>
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

export default function ApplicationsPage() {
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
                <ApplicationRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
