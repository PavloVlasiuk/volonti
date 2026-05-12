import client from './client'
import type { Application, ApplicationStatus } from '../types/application.types'

export async function submitApplication(initiativeId: string): Promise<Application> {
  const res = await client.post(`/initiatives/${initiativeId}/applications`)
  return res.data
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  const res = await client.patch(`/applications/${id}`, { status })
  return res.data
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await client.get('/volunteer/applications')
  return res.data
}
