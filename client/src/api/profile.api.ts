import client from './client'
import type { FeedItem, FormatPreference } from '../types/initiative.types'
import type { AchievementsSummary } from '../types/achievement.types'

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

export async function getFeed(): Promise<FeedItem[]> {
  const res = await client.get('/volunteer/feed')
  return res.data
}

export async function getAchievements(): Promise<AchievementsSummary> {
  const res = await client.get('/volunteer/achievements')
  return res.data
}
