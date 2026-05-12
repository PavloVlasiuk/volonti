export const ApplicationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export interface Application {
  id: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  initiative: {
    id: string
    title: string
    organization: { id: string; name: string }
  }
  volunteer: { id: string; firstName: string; lastName: string }
}
