export type AchievementBadge = '10h' | '50h' | '100h';

export interface CompletedAchievementDto {
  applicationId: string;
  initiativeId: string;
  initiativeTitle: string;
  organizationId: string;
  organizationName: string;
  hours: number;
  completedAt: Date;
}

export class AchievementsDto {
  totalHours: number;
  completedCount: number;
  badges: AchievementBadge[];
  completed: CompletedAchievementDto[];

  constructor(input: {
    totalHours: number;
    completedCount: number;
    badges: AchievementBadge[];
    completed: CompletedAchievementDto[];
  }) {
    this.totalHours = input.totalHours;
    this.completedCount = input.completedCount;
    this.badges = input.badges;
    this.completed = input.completed;
  }
}
