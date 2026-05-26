import client from './client'
import type {
  Organization,
  OrganizationPublic,
} from '../types/organization.types'

export async function getOrgProfile(): Promise<Organization> {
  const res = await client.get('/organizations/me')
  return res.data
}

export async function getOrganizationPublic(
  id: string,
): Promise<OrganizationPublic> {
  const res = await client.get(`/organizations/${id}`)
  return res.data
}
