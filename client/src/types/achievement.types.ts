export type AchievementBadge = '10h' | '50h' | '100h'

export interface CompletedAchievement {
  applicationId: string
  initiativeId: string
  initiativeTitle: string
  organizationId: string
  organizationName: string
  hours: number
  completedAt: string
}

export interface AchievementsSummary {
  totalHours: number
  completedCount: number
  badges: AchievementBadge[]
  completed: CompletedAchievement[]
}
