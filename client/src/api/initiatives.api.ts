import client from './client'
import type { Initiative } from '../types/initiative.types'
import type { Application } from '../types/application.types'
import type { FormatType, InitiativeType } from '../types/initiative.types'
import type { Paginated } from '../types/pagination.types'

export interface InitiativeFilters {
  category?: string
  city?: string
  format?: FormatType
  type?: InitiativeType
  organizationId?: string
  page?: number
  limit?: number
}

export async function getInitiatives(
  filters?: InitiativeFilters,
): Promise<Paginated<Initiative>> {
  const res = await client.get('/initiatives', { params: filters })
  return res.data
}

export async function getInitiative(id: string): Promise<Initiative> {
  const res = await client.get(`/initiatives/${id}`)
  return res.data
}

export async function getMyInitiatives(): Promise<Initiative[]> {
  const res = await client.get('/initiatives/mine')
  return res.data
}

export async function createInitiative(data: unknown): Promise<Initiative> {
  const res = await client.post('/initiatives', data)
  return res.data
}

export async function updateInitiative(id: string, data: unknown): Promise<Initiative> {
  const res = await client.put(`/initiatives/${id}`, data)
  return res.data
}

export async function closeInitiative(id: string): Promise<Initiative> {
  const res = await client.patch(`/initiatives/${id}/status`, { status: 'CLOSED' })
  return res.data
}

export async function deleteInitiative(id: string): Promise<void> {
  await client.delete(`/initiatives/${id}`)
}

export async function getInitiativeApplications(id: string): Promise<Application[]> {
  const res = await client.get(`/initiatives/${id}/applications`)
  return res.data
}

export interface ParticipationEntry {
  applicationId: string
  participated: boolean
  hours: number
}

export async function completeInitiative(
  id: string,
  dto: { participations: ParticipationEntry[] }
): Promise<Initiative> {
  const res = await client.post(`/initiatives/${id}/complete`, dto)
  return res.data
}

export async function dismissInitiative(id: string): Promise<void> {
  await client.post(`/initiatives/${id}/dismiss`)
}
