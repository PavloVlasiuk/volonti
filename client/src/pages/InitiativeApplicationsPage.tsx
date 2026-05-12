import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { getInitiative, getInitiativeApplications } from '../api/initiatives.api'
import { updateApplicationStatus } from '../api/applications.api'
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
  onAccept,
  onReject,
  isUpdating,
}: {
  app: Application
  onAccept: (id: string) => void
  onReject: (id: string) => void
  isUpdating: boolean
}) {
  const isDecided = app.status !== 'PENDING'
  const fullName = `${app.volunteer.firstName} ${app.volunteer.lastName}`

  return (
    <Card className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white">{fullName}</p>
        <p className="mt-0.5 text-xs text-muted">
          Подано: {new Date(app.createdAt).toLocaleDateString('uk-UA')}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Badge variant={STATUS_BADGE[app.status]}>
          {STATUS_LABEL[app.status]}
        </Badge>

        {!isDecided && (
          <>
            <Button
              size="sm"
              onClick={() => onAccept(app.id)}
              disabled={isUpdating}
            >
              Прийняти
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => onReject(app.id)}
              disabled={isUpdating}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Відхилити
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

export default function InitiativeApplicationsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

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

  const updateMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(appId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['initiative-applications', id] }),
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
                  onAccept={(appId) =>
                    updateMutation.mutate({ appId, status: 'ACCEPTED' })
                  }
                  onReject={(appId) =>
                    updateMutation.mutate({ appId, status: 'REJECTED' })
                  }
                  isUpdating={updateMutation.isPending}
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
