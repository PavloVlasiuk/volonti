export const ActorType = {
  USER: 'USER',
  ORGANIZATION: 'ORGANIZATION',
} as const

export type ActorType = (typeof ActorType)[keyof typeof ActorType]

export const UserRole = {
  VOLUNTEER: 'VOLUNTEER',
  ADMIN: 'ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface AuthUser {
  id: string
  email: string
  actor: ActorType
  role?: UserRole
}
