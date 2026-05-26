import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Initiative } from '../types/initiative.types'
import { formatDateShort } from '../utils/formatDate'
import { dismissInitiative } from '../api/initiatives.api'
import Badge from './Badge'
import Card from './Card'
import MatchScoreBar from './MatchScoreBar'

interface Props {
  initiative: Initiative
  matchScore?: number
  reasons?: string[]
  compact?: boolean
  dismissible?: boolean
}

const typeBadge: Record<string, { variant: 'urgent' | 'regular' | 'ongoing'; label: string }> = {
  URGENT: { variant: 'urgent', label: 'ТЕРМІНОВА' },
  PLANNED: { variant: 'regular', label: 'ПЛАНОВА' },
  ONGOING: { variant: 'ongoing', label: 'ПОСТІЙНА' },
}

function DateRow({ initiative }: { initiative: Initiative }) {
  if (initiative.type === 'URGENT') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
        Терміново
      </span>
    )
  }
  if (initiative.type === 'ONGOING') {
    return <span className="text-xs text-muted">Постійна роль</span>
  }
  if (initiative.startsAt || initiative.endsAt) {
    return (
      <span className="text-xs text-muted">
        {formatDateShort(initiative.startsAt ?? undefined)} — {formatDateShort(initiative.endsAt ?? undefined)}
      </span>
    )
  }
  return null
}

export default function InitiativeCard({
  initiative,
  matchScore,
  reasons,
  compact = false,
  dismissible = false,
}: Props) {
  const badge = typeBadge[initiative.type] ?? typeBadge.PLANNED
  const queryClient = useQueryClient()
  const dismissMutation = useMutation({
    mutationFn: () => dismissInitiative(initiative.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return (
    <Card className={`relative flex flex-col gap-3 ${compact ? 'p-4' : 'p-5'} hover:border-white/20 transition-colors`}>
      {dismissible && (
        <button
          type="button"
          onClick={() => dismissMutation.mutate()}
          disabled={dismissMutation.isPending}
          title="Не показувати більше"
          aria-label="Не показувати більше"
          className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-bg/60 text-muted transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
        >
          ×
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <Badge variant="category">{initiative.categoryName}</Badge>
      </div>

      <div className="flex-1 space-y-1">
        <h3 className={`font-semibold text-white line-clamp-2 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
          {initiative.title}
        </h3>
        <p className="text-xs text-muted line-clamp-1 flex items-center gap-1.5">
          <Link
            to={`/organizations/${initiative.organization.id}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-accent transition-colors"
          >
            {initiative.organization.name}
          </Link>
          {initiative.organization.avgRating !== null && (
            <span className="text-accent">
              · ★ {initiative.organization.avgRating.toFixed(1)}
            </span>
          )}
          {initiative.city ? <span>· {initiative.city}</span> : null}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <DateRow initiative={initiative} />
        {initiative.slotsNeeded != null && (
          <span className="text-xs font-medium text-accent">
            {initiative.acceptedCount} / {initiative.slotsNeeded}
          </span>
        )}
      </div>

      {matchScore !== undefined && <MatchScoreBar score={matchScore} reasons={reasons} />}

      <div className="flex justify-end pt-1">
        <Link
          to={`/initiatives/${initiative.id}`}
          className="text-xs font-medium text-accent hover:underline"
        >
          Детальніше →
        </Link>
      </div>
    </Card>
  )
}
