import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Initiative } from '../types/initiative.types'
import { formatDateShort } from '../utils/formatDate'
import { dismissInitiative } from '../api/initiatives.api'
import Badge from './Badge'
import Card from './Card'
import MatchScoreBar from './MatchScoreBar'

type Variant = 'default' | 'feed' | 'hero'

interface Props {
  initiative: Initiative
  matchScore?: number
  reasons?: string[]
  compact?: boolean
  dismissible?: boolean
  variant?: Variant
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

function ScoreBadge({ score, size }: { score: number; size: 'sm' | 'lg' }) {
  if (size === 'lg') {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10">
        <span className="text-base font-bold text-accent">{score}</span>
      </div>
    )
  }
  return (
    <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
      {score}%
    </span>
  )
}

function DismissIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  )
}

export default function InitiativeCard({
  initiative,
  matchScore,
  reasons,
  compact = false,
  dismissible = false,
  variant = 'default',
}: Props) {
  const badge = typeBadge[initiative.type] ?? typeBadge.PLANNED
  const queryClient = useQueryClient()
  const dismissMutation = useMutation({
    mutationFn: () => dismissInitiative(initiative.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const isHero = variant === 'hero'
  const isFeed = variant === 'feed' || isHero
  const padding = isHero ? 'p-7' : compact ? 'p-4' : 'p-5'
  const titleSize = isHero ? 'text-xl' : compact ? 'text-sm' : 'text-base'
  const hasScore = isFeed && matchScore !== undefined
  const showStrongMatch = hasScore && matchScore >= 80
  const borderClass = showStrongMatch
    ? 'border-accent/40'
    : 'hover:border-white/20'
  const topReason = reasons?.[0]
  const extraReasons = reasons?.slice(1) ?? []

  const rightPad = isHero
    ? hasScore
      ? 'pr-20'
      : dismissible
      ? 'pr-10'
      : ''
    : hasScore && dismissible
    ? 'pr-24'
    : hasScore
    ? 'pr-14'
    : dismissible
    ? 'pr-10'
    : ''

  return (
    <Card
      className={`relative flex flex-col gap-3 ${padding} ${borderClass} transition-colors`}
    >
      {(dismissible || hasScore) && (
        <div
          className={`absolute right-3 top-3 z-10 flex gap-2 ${
            isHero ? 'flex-col items-end gap-3' : 'flex-row-reverse items-center'
          }`}
        >
          {dismissible && (
            <button
              type="button"
              onClick={() => dismissMutation.mutate()}
              disabled={dismissMutation.isPending}
              title="Не показувати більше"
              aria-label="Не показувати більше"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-bg/60 text-muted transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              <DismissIcon />
            </button>
          )}
          {hasScore && (
            <ScoreBadge score={matchScore} size={isHero ? 'lg' : 'sm'} />
          )}
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${rightPad}`}>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <Badge variant="category">{initiative.categoryName}</Badge>
        {isFeed && topReason && (
          <span className="rounded-full bg-accent/10 border border-accent/30 px-2 py-0.5 text-[10px] font-medium text-accent">
            ✦ {topReason}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h3 className={`font-semibold text-white line-clamp-2 leading-snug ${titleSize}`}>
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
        {isHero && (
          <p className="pt-2 text-sm text-white/70 line-clamp-2">
            {initiative.description}
          </p>
        )}
      </div>

      {isFeed && extraReasons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {extraReasons.map((r) => (
            <span
              key={r}
              className="rounded-full border border-white/10 bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <DateRow initiative={initiative} />
        {initiative.slotsNeeded != null && (
          <span className="text-xs font-medium text-accent">
            {initiative.acceptedCount} / {initiative.slotsNeeded}
          </span>
        )}
      </div>

      {!isFeed && matchScore !== undefined && (
        <MatchScoreBar score={matchScore} reasons={reasons} />
      )}

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
