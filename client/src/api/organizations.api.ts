import client from './client'
import type { Organization } from '../types/organization.types'

export async function getOrgProfile(): Promise<Organization> {
  const res = await client.get('/organizations/me')
  return res.data
}
