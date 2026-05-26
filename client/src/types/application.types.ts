import type { FormatPreference } from './initiative.types'

export const ApplicationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const AvailabilitySlot = {
  WEEKDAYS: 'WEEKDAYS',
  WEEKENDS: 'WEEKENDS',
  EVENINGS: 'EVENINGS',
  FULL_TIME: 'FULL_TIME',
} as const

export type AvailabilitySlot = (typeof AvailabilitySlot)[keyof typeof AvailabilitySlot]

export interface Application {
  id: string
  status: ApplicationStatus
  motivation: string
  availability: AvailabilitySlot[]
  contactPhone: string | null
  experience: string | null
  hasTransport: boolean
  canStartImmediately: boolean
  participated: boolean | null
  hoursLogged: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  initiative: {
    id: string
    title: string
    organization: { id: string; name: string }
  }
  volunteer: {
    id: string
    firstName: string
    lastName: string
    city: string | null
    age: number | null
    formatPreference: FormatPreference
    bio: string | null
    interests: { id: string; name: string }[]
    avgRating: number | null
    reviewCount: number
  }
}

export interface SubmitApplicationPayload {
  motivation: string
  availability: AvailabilitySlot[]
  contactPhone?: string
  experience?: string
  hasTransport: boolean
  canStartImmediately: boolean
}
