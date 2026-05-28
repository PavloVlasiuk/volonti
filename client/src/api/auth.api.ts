import client from './client'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface OtpRequiredResponse {
  status: 'otp_required'
  pendingToken: string
}

export interface TokensResponse {
  accessToken: string
  refreshToken: string
}

export async function registerVolunteer(data: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<void> {
  await client.post('/auth/register/volunteer', data)
}

export async function registerOrganization(form: FormData): Promise<void> {
  await client.post('/auth/register/organization', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function login(
  data: { email: string; password: string }
): Promise<LoginResponse | OtpRequiredResponse> {
  const res = await client.post('/auth/login', data)
  return res.data
}

export async function loginOrganization(
  data: { email: string; password: string }
): Promise<OtpRequiredResponse> {
  const res = await client.post('/auth/login/organization', data)
  return res.data
}

export async function verifyOtp(data: {
  pendingToken: string
  code: string
}): Promise<TokensResponse> {
  const res = await client.post('/auth/verify-otp', data)
  return res.data
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}

export async function enableTwoFa(): Promise<void> {
  await client.post('/auth/2fa/enable')
}

export async function disableTwoFa(): Promise<void> {
  await client.post('/auth/2fa/disable')
}
