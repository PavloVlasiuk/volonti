import type { OrgStatus } from './organization.types'

export const InitiativeType = {
  PLANNED: 'PLANNED',
  URGENT: 'URGENT',
  ONGOING: 'ONGOING',
} as const

export type InitiativeType = (typeof InitiativeType)[keyof typeof InitiativeType]

export const FormatType = {
  REMOTE: 'REMOTE',
  ON_SITE: 'ON_SITE',
} as const

export type FormatType = (typeof FormatType)[keyof typeof FormatType]

export const FormatPreference = {
  REMOTE: 'REMOTE',
  ON_SITE: 'ON_SITE',
  ANY: 'ANY',
} as const

export type FormatPreference = (typeof FormatPreference)[keyof typeof FormatPreference]

export const InitiativeStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  COMPLETED: 'COMPLETED',
} as const

export type InitiativeStatus = (typeof InitiativeStatus)[keyof typeof InitiativeStatus]

export interface Initiative {
  id: string
  title: string
  description: string
  requirements: string | null
  type: InitiativeType
  format: FormatType
  status: InitiativeStatus
  city: string | null
  startsAt: string | null
  endsAt: string | null
  minAge: number | null
  slotsNeeded: number | null
  acceptedCount: number
  completedAt: string | null
  organization: {
    id: string
    name: string
    status: OrgStatus
    email: string
  }
  categoryId: string
  categoryName: string
  createdAt: string
  updatedAt: string
}

export type FeedItem = Initiative & { matchScore: number }
