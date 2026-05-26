import client from './client'
import type {
  FeedItem,
  FormatPreference,
  FormatType,
  InitiativeType,
} from '../types/initiative.types'
import type { AchievementsSummary } from '../types/achievement.types'
import type { Paginated } from '../types/pagination.types'

export interface VolunteerProfile {
  id: string
  firstName: string
  lastName: string
  city: string | null
  age: number | null
  formatPreference: FormatPreference
  bio: string | null
  updatedAt: string
  interests: { id: string; name: string }[]
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  city?: string
  age?: number
  formatPreference?: FormatPreference
  categoryIds?: string[]
}

export async function getProfile(): Promise<VolunteerProfile> {
  const res = await client.get('/volunteer/profile')
  return res.data
}

export async function updateProfile(data: UpdateProfileDto): Promise<VolunteerProfile> {
  const res = await client.put('/volunteer/profile', data)
  return res.data
}

export interface FeedQuery {
  category?: string
  city?: string
  format?: FormatType
  type?: InitiativeType
  page?: number
  limit?: number
}

export async function getFeed(query?: FeedQuery): Promise<Paginated<FeedItem>> {
  const res = await client.get('/volunteer/feed', { params: query })
  return res.data
}

export async function getAchievements(): Promise<AchievementsSummary> {
  const res = await client.get('/volunteer/achievements')
  return res.data
}
