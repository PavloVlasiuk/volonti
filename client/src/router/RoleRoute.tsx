import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ActorType, type UserRole } from '../types/user.types'

interface Props {
  actor?: 'USER' | 'ORGANIZATION'
  role?: UserRole
}

const actorHome: Record<string, string> = {
  VOLUNTEER: '/feed',
  ORGANIZATION: '/dashboard',
  ADMIN: '/admin/organizations',
}

function getHome(actor: string, role?: string): string {
  if (actor === ActorType.ORGANIZATION) return '/dashboard'
  return actorHome[role ?? ''] ?? '/'
}

function isAllowed(
  userActor: string,
  userRole: string | undefined,
  requiredActor?: string,
  requiredRole?: string,
): boolean {
  if (requiredActor === ActorType.ORGANIZATION) {
    return userActor === ActorType.ORGANIZATION
  }
  if (requiredRole) {
    return userActor === ActorType.USER && userRole === requiredRole
  }
  return false
}

export default function RoleRoute({ actor, role }: Props) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  if (!isAllowed(user.actor, user.role, actor, role)) {
    return <Navigate to={getHome(user.actor, user.role)} replace />
  }

  return <Outlet />
}
