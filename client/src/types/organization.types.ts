export const OrgType = {
  NGO: 'NGO',
  CHARITY: 'CHARITY',
  MUNICIPAL: 'MUNICIPAL',
  CRISIS_CENTER: 'CRISIS_CENTER',
} as const

export type OrgType = (typeof OrgType)[keyof typeof OrgType]

export const OrgStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const

export type OrgStatus = (typeof OrgStatus)[keyof typeof OrgStatus]

export interface Organization {
  id: string
  name: string
  type: OrgType
  edrpou: string
  contactPerson: string
  documentUrl: string | null
  email: string
  status: OrgStatus
  rejectionReason: string | null
  verifiedAt: string | null
  createdAt: string
}
