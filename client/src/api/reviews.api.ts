import client from './client'
import type { CreateReviewPayload, Review } from '../types/review.types'

export async function createReviewFromVolunteer(
  initiativeId: string,
  dto: CreateReviewPayload
): Promise<Review> {
  const res = await client.post(`/initiatives/${initiativeId}/reviews`, dto)
  return res.data
}

export async function createReviewFromOrganization(
  initiativeId: string,
  dto: CreateReviewPayload
): Promise<Review> {
  const res = await client.post(
    `/initiatives/${initiativeId}/reviews/from-organization`,
    dto
  )
  return res.data
}

export async function getOrgReviews(orgId: string): Promise<Review[]> {
  const res = await client.get(`/organizations/${orgId}/reviews`)
  return res.data
}

export async function getOwnReviewFromVolunteer(
  initiativeId: string
): Promise<Review | null> {
  const res = await client.get(`/initiatives/${initiativeId}/reviews/own`)
  return res.data
}

export async function getOwnReviewFromOrganization(
  initiativeId: string,
  targetId: string
): Promise<Review | null> {
  const res = await client.get(
    `/initiatives/${initiativeId}/reviews/own/from-organization`,
    { params: { targetId } }
  )
  return res.data
}
