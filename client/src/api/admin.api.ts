import client from './client'
import type { Organization, OrgStatus } from '../types/organization.types'

export async function getOrganizations(status?: OrgStatus): Promise<Organization[]> {
  const res = await client.get('/admin/organizations', { params: { status } })
  return res.data
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await client.get(`/admin/organizations/${id}`)
  return res.data
}

export async function verifyOrganization(id: string): Promise<void> {
  await client.post(`/admin/organizations/${id}/verify`)
}

export async function rejectOrganization(id: string, reason: string): Promise<void> {
  await client.post(`/admin/organizations/${id}/reject`, { reason })
}
