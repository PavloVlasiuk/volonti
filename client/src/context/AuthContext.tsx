import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { ActorType, type UserRole, type AuthUser } from '../types/user.types'

type JwtPayload =
  | { sub: string; email: string; actor: 'USER'; role: UserRole }
  | { sub: string; email: string; actor: 'ORGANIZATION' }

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isVolunteer: boolean
  isOrganization: boolean
  isAdmin: boolean
  login: (tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (payload.actor === ActorType.ORGANIZATION) {
      return { id: payload.sub, email: payload.email, actor: ActorType.ORGANIZATION }
    }
    return { id: payload.sub, email: payload.email, actor: ActorType.USER, role: payload.role }
  } catch {
    return null
  }
}

function computeFlags(user: AuthUser | null) {
  return {
    isVolunteer: user?.actor === ActorType.USER && user.role === 'VOLUNTEER',
    isOrganization: user?.actor === ActorType.ORGANIZATION,
    isAdmin: user?.actor === ActorType.USER && user.role === 'ADMIN',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('accessToken')
    return token ? decodeToken(token) : null
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setUser(token ? decodeToken(token) : null)
  }, [])

  function login(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    setUser(decodeToken(tokens.accessToken))
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const flags = computeFlags(user)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, ...flags, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
