import client from './client'
import type {
  Application,
  ApplicationStatus,
  SubmitApplicationPayload,
} from '../types/application.types'

export async function submitApplication(
  initiativeId: string,
  dto: SubmitApplicationPayload
): Promise<Application> {
  const res = await client.post(`/initiatives/${initiativeId}/applications`, dto)
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

export async function downloadCertificate(applicationId: string): Promise<void> {
  const res = await client.get(`/applications/${applicationId}/certificate.pdf`, {
    responseType: 'blob',
  })
  const blobUrl = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = 'VolonTi-Certificate.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
