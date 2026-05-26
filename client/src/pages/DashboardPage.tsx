import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import CompleteInitiativeModal from '../components/CompleteInitiativeModal'
import { getMyInitiatives, closeInitiative } from '../api/initiatives.api'
import { getOrgProfile } from '../api/organizations.api'
import { formatDate } from '../utils/formatDate'
import type { Initiative } from '../types/initiative.types'

const STATUS_BADGE: Record<string, 'active' | 'closed' | 'accepted'> = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  COMPLETED: 'accepted',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Активна',
  CLOSED: 'Закрита',
  COMPLETED: 'Завершена',
}

function InitiativeRow({
  initiative,
  onClose,
  onComplete,
  isClosing,
}: {
  initiative: Initiative
  onClose: (id: string) => void
  onComplete: (initiative: Initiative) => void
  isClosing: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const isActive = initiative.status === 'ACTIVE'
  const isClosed = initiative.status === 'CLOSED'

  return (
    <Card className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant={STATUS_BADGE[initiative.status]}>
            {STATUS_LABEL[initiative.status]}
          </Badge>
          <Badge variant="category">{initiative.categoryName}</Badge>
        </div>
        <p className="font-semibold text-white line-clamp-1">{initiative.title}</p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDate(initiative.createdAt)}
          {initiative.city ? ` · ${initiative.city}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          to={`/initiatives/${initiative.id}/applications`}
          className="text-xs text-muted hover:text-white transition-colors"
        >
          Заявки
        </Link>
        {isActive && (
          <Link
            to={`/initiatives/${initiative.id}/edit`}
            className="text-xs text-accent hover:underline"
          >
            Редагувати
          </Link>
        )}
        {(isActive || isClosed) && (
          <button
            onClick={() => onComplete(initiative)}
            className="text-xs text-accent hover:underline"
          >
            Завершити ✓
          </button>
        )}
        {isActive && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-muted hover:text-red-400 transition-colors"
          >
            Закрити
          </button>
        )}
        {isActive && confirming && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Підтвердити?</span>
            <button
              onClick={() => { onClose(initiative.id); setConfirming(false) }}
              disabled={isClosing}
              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Так
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-muted hover:text-white"
            >
              Ні
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [completingInitiative, setCompletingInitiative] = useState<Initiative | null>(null)

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['orgProfile'],
    queryFn: getOrgProfile,
  })

  const { data: initiatives = [], isLoading: initLoading } = useQuery({
    queryKey: ['myInitiatives'],
    queryFn: getMyInitiatives,
  })

  const closeMutation = useMutation({
    mutationFn: closeInitiative,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myInitiatives'] }),
  })

  const isPending = org?.status === 'PENDING'
  const isLoading = orgLoading || initLoading

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Мої ініціативи</h1>
            <Button
              onClick={() => navigate('/initiatives/new')}
              disabled={isPending}
              title={isPending ? 'Акаунт не верифіковано' : undefined}
            >
              Нова ініціатива +
            </Button>
          </div>

          {/* Pending banner */}
          {isPending && (
            <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
              <p className="text-sm text-yellow-300 font-medium">
                Акаунт очікує верифікації — публікація ініціатив недоступна
              </p>
              <p className="mt-1 text-xs text-yellow-300/70">
                Ми надішлемо email після перевірки вашої організації адміністратором.
              </p>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : initiatives.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <p className="text-lg font-semibold text-white">Ще немає ініціатив</p>
              <p className="text-sm text-muted max-w-xs">
                Опублікуйте першу ініціативу, щоб залучити волонтерів до вашої діяльності.
              </p>
              {!isPending && (
                <Button className="mt-2" onClick={() => navigate('/initiatives/new')}>
                  Створити ініціативу
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {initiatives.map(initiative => (
                <InitiativeRow
                  key={initiative.id}
                  initiative={initiative}
                  onClose={(id) => closeMutation.mutate(id)}
                  onComplete={(i) => setCompletingInitiative(i)}
                  isClosing={closeMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {completingInitiative && (
        <CompleteInitiativeModal
          initiativeId={completingInitiative.id}
          initiativeTitle={completingInitiative.title}
          onClose={() => setCompletingInitiative(null)}
        />
      )}

      <Footer />
    </div>
  )
}
