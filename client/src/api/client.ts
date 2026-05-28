import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const client = axios.create({ baseURL: BASE_URL })

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err)

    const originalRequest = err.config as typeof err.config & { _retry?: boolean }
    if (err.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest?.headers.set('Authorization', `Bearer ${token}`)
        return client(originalRequest!)
      })
    }

    originalRequest!._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      isRefreshing = false
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    try {
      const res = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        null,
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      )
      const newToken = res.data.accessToken
      localStorage.setItem('accessToken', newToken)
      processQueue(null, newToken)
      originalRequest?.headers.set('Authorization', `Bearer ${newToken}`)
      return client(originalRequest!)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default client
