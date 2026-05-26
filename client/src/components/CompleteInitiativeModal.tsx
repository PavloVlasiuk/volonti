import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from './Button'
import Spinner from './Spinner'
import {
  completeInitiative,
  getInitiativeApplications,
  type ParticipationEntry,
} from '../api/initiatives.api'

interface Props {
  initiativeId: string
  initiativeTitle: string
  onClose: () => void
}

interface Row {
  applicationId: string
  fullName: string
  participated: boolean
  hours: number
}

export default function CompleteInitiativeModal({
  initiativeId,
  initiativeTitle,
  onClose,
}: Props) {
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['initiative-applications', initiativeId],
    queryFn: () => getInitiativeApplications(initiativeId),
  })

  const accepted = useMemo(
    () => applications.filter((a) => a.status === 'ACCEPTED'),
    [applications]
  )

  const [rows, setRows] = useState<Row[] | null>(null)

  const currentRows: Row[] =
    rows ??
    accepted.map((a) => ({
      applicationId: a.id,
      fullName: `${a.volunteer.firstName} ${a.volunteer.lastName}`,
      participated: false,
      hours: 0,
    }))

  function update(id: string, patch: Partial<Row>) {
    const base = rows ?? currentRows
    setRows(base.map((r) => (r.applicationId === id ? { ...r, ...patch } : r)))
  }

  const submitDisabled = currentRows.some(
    (r) => r.participated && r.hours <= 0
  )

  const mutation = useMutation({
    mutationFn: () =>
      completeInitiative(initiativeId, {
        participations: currentRows.map<ParticipationEntry>((r) => ({
          applicationId: r.applicationId,
          participated: r.participated,
          hours: r.participated ? r.hours : 0,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInitiatives'] })
      queryClient.invalidateQueries({
        queryKey: ['initiative-applications', initiativeId],
      })
      queryClient.invalidateQueries({ queryKey: ['initiative', initiativeId] })
      onClose()
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-surface border border-white/[0.08] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white"
          aria-label="Закрити"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Завершити ініціативу</h2>
        <p className="text-sm text-muted mb-2 line-clamp-2">{initiativeTitle}</p>

        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-300">
            Цю дію неможливо скасувати. Позначте, хто з прийнятих волонтерів
            насправді брав участь і скільки годин відпрацював.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : currentRows.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">
            Немає прийнятих заявок. Ініціативу можна завершити без участі.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mb-5">
            {currentRows.map((row) => (
              <div
                key={row.applicationId}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3"
              >
                <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-accent h-4 w-4 shrink-0"
                    checked={row.participated}
                    onChange={(e) =>
                      update(row.applicationId, { participated: e.target.checked })
                    }
                  />
                  <span className="text-sm text-white truncate">{row.fullName}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={999.9}
                  value={row.hours}
                  disabled={!row.participated}
                  onChange={(e) =>
                    update(row.applicationId, {
                      hours: Number(e.target.value),
                    })
                  }
                  className="w-24 rounded-lg bg-bg border border-white/[0.08] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-50"
                  placeholder="год"
                />
                <span className="text-xs text-muted shrink-0">год</span>
              </div>
            ))}
          </div>
        )}

        {mutation.isError && (
          <p className="mb-3 text-sm text-red-400">
            Не вдалося завершити. Спробуйте ще раз.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="filled"
            loading={mutation.isPending}
            disabled={submitDisabled}
            onClick={() => mutation.mutate()}
            className="flex-1"
          >
            Завершити
          </Button>
          <Button type="button" variant="outlined" onClick={onClose}>
            Скасувати
          </Button>
        </div>
      </div>
    </div>
  )
}
