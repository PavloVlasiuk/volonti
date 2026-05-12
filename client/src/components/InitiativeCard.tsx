import { Link } from 'react-router-dom'
import type { Initiative } from '../types/initiative.types'
import { formatDateShort } from '../utils/formatDate'
import Badge from './Badge'
import Card from './Card'
import MatchScoreBar from './MatchScoreBar'

interface Props {
  initiative: Initiative
  matchScore?: number
  compact?: boolean
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

export default function InitiativeCard({ initiative, matchScore, compact = false }: Props) {
  const badge = typeBadge[initiative.type] ?? typeBadge.PLANNED

  return (
    <Card className={`flex flex-col gap-3 ${compact ? 'p-4' : 'p-5'} hover:border-white/20 transition-colors`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <Badge variant="category">{initiative.categoryName}</Badge>
      </div>

      <div className="flex-1 space-y-1">
        <h3 className={`font-semibold text-white line-clamp-2 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
          {initiative.title}
        </h3>
        <p className="text-xs text-muted line-clamp-1">
          {initiative.organization.name}
          {initiative.city ? ` · ${initiative.city}` : ''}
        </p>
      </div>

      <DateRow initiative={initiative} />

      {matchScore !== undefined && <MatchScoreBar score={matchScore} />}

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
