import type { Initiative, FormatType } from '../types/initiative.types'
import type { VolunteerProfile } from '../api/profile.api'

const FORMAT_COMPAT: Record<string, string[]> = {
  ONLINE: ['ONLINE', 'HYBRID'],
  ON_SITE: ['ON_SITE', 'HYBRID'],
  HYBRID: ['ONLINE', 'ON_SITE', 'HYBRID'],
}

export function computeMatchScore(initiative: Initiative, profile: VolunteerProfile): number {
  if (!profile.interests?.length) return 0

  let score = 0

  const categoryMatch = profile.interests.some(i => i.id === initiative.categoryId)
  if (categoryMatch) score += 60

  const pref = profile.formatPreference as FormatType | undefined
  if (pref) {
    const compatible = FORMAT_COMPAT[pref] ?? []
    if (compatible.includes(initiative.format)) score += 25
  }

  const age = profile.age
  const minAge = initiative.minAge
  if (!minAge || (age && age >= minAge)) score += 15

  return Math.min(score, 100)
}
