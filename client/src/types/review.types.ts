export const ReviewParty = {
  VOLUNTEER: 'VOLUNTEER',
  ORGANIZATION: 'ORGANIZATION',
} as const

export type ReviewParty = (typeof ReviewParty)[keyof typeof ReviewParty]

export interface Review {
  id: string
  initiativeId: string
  authorType: ReviewParty
  authorId: string
  authorName: string
  targetType: ReviewParty
  targetId: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
  targetId?: string
}
