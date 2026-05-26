export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN',
}

export enum OrgType {
  NGO = 'NGO',
  CHARITY = 'CHARITY',
  MUNICIPAL = 'MUNICIPAL',
  CRISIS_CENTER = 'CRISIS_CENTER',
}

export enum OrgStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum FormatType {
  REMOTE = 'REMOTE',
  ON_SITE = 'ON_SITE',
}

export enum FormatPreference {
  REMOTE = 'REMOTE',
  ON_SITE = 'ON_SITE',
  ANY = 'ANY',
}

export enum InitiativeType {
  URGENT = 'URGENT',
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
}

export enum InitiativeStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ActorType {
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
}

export enum AvailabilitySlot {
  WEEKDAYS = 'WEEKDAYS',
  WEEKENDS = 'WEEKENDS',
  EVENINGS = 'EVENINGS',
  FULL_TIME = 'FULL_TIME',
}
