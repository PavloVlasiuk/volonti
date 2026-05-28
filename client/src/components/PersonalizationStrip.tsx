import { Link } from 'react-router-dom'
import type { VolunteerProfile } from '../api/profile.api'

const FORMAT_LABEL: Record<string, string> = {
  REMOTE: 'Онлайн',
  ON_SITE: 'Офлайн',
  ANY: 'Будь-який формат',
}

interface Props {
  profile: VolunteerProfile | undefined
}

export default function PersonalizationStrip({ profile }: Props) {
  if (!profile) return null

  const interests = profile.interests ?? []
  const hasCity = !!profile.city
  const hasFormat = profile.formatPreference && profile.formatPreference !== 'ANY'

  if (interests.length === 0 && !hasCity && !hasFormat) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-surface/50 border border-white/[0.04] px-4 py-3">
      <span className="text-xs uppercase tracking-widest text-muted">
        Підбираємо за
      </span>

      {interests.map((i) => (
        <span
          key={i.id}
          className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-medium text-accent"
        >
          {i.name}
        </span>
      ))}

      {hasCity && (
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
          {profile.city}
        </span>
      )}

      {hasFormat && (
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
          {FORMAT_LABEL[profile.formatPreference] ?? profile.formatPreference}
        </span>
      )}

      <Link
        to="/profile"
        className="ml-auto text-xs font-medium text-accent hover:underline"
      >
        Налаштувати →
      </Link>
    </div>
  )
}
