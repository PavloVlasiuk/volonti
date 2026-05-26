import { Injectable } from '@nestjs/common';
import {
  FormatPreference,
  FormatType,
  InitiativeType,
} from '../../../common/enums';
import { InitiativeDto } from '../../initiatives/dtos/initiative.dto';
import { VolunteerProfileDto } from '../../volunteer-profiles/dtos/volunteer-profile.dto';

const WEIGHTS = {
  interest: 0.4,
  location: 0.2,
  format: 0.1,
  urgency: 0.1,
  startsSoon: 0.1,
  recency: 0.1,
} as const;

const URGENCY_VALUES: Record<InitiativeType, number> = {
  [InitiativeType.URGENT]: 1,
  [InitiativeType.PLANNED]: 0.5,
  [InitiativeType.ONGOING]: 0.3,
};

const REASON_PRIORITY = [
  'interest',
  'urgency',
  'location',
  'startsSoon',
  'format',
  'recency',
] as const;

type ReasonKey = (typeof REASON_PRIORITY)[number];

interface TermValues {
  interest: number;
  location: number;
  format: number;
  urgency: number;
  startsSoon: number;
  recency: number;
}

export interface MatchResult {
  score: number;
  reasons: string[];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function daysBetween(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / MS_PER_DAY;
}

@Injectable()
export class MatchingService {
  scoreForVolunteer(
    initiative: InitiativeDto,
    profile: VolunteerProfileDto,
    appliedAffinity: Map<string, number>,
  ): MatchResult {
    const now = new Date();
    const terms = this.computeTerms(initiative, profile, appliedAffinity, now);

    const weighted =
      WEIGHTS.interest * terms.interest +
      WEIGHTS.location * terms.location +
      WEIGHTS.format * terms.format +
      WEIGHTS.urgency * terms.urgency +
      WEIGHTS.startsSoon * terms.startsSoon +
      WEIGHTS.recency * terms.recency;

    const score = Math.round(clamp01(weighted) * 100);
    const reasons = this.buildReasons(initiative, profile, terms, now);
    return { score, reasons };
  }

  private computeTerms(
    initiative: InitiativeDto,
    profile: VolunteerProfileDto,
    appliedAffinity: Map<string, number>,
    now: Date,
  ): TermValues {
    const profileInterestIds = profile.interests?.map((i) => i.id) ?? [];
    const profileInterestsCount = Math.max(profileInterestIds.length, 1);
    const matchingInterests = profileInterestIds.includes(initiative.categoryId)
      ? 1
      : 0;
    const affinity = appliedAffinity.get(initiative.categoryId) ?? 0;
    const interest = clamp01(
      matchingInterests / profileInterestsCount + 0.5 * affinity,
    );

    let location = 0;
    if (initiative.format === FormatType.REMOTE) {
      location = 1;
    } else if (
      initiative.format === FormatType.ON_SITE &&
      profile.city &&
      initiative.city &&
      profile.city.toLowerCase() === initiative.city.toLowerCase()
    ) {
      location = 1;
    }

    let format = 0;
    if (profile.formatPreference === FormatPreference.ANY) {
      format = 1;
    } else if (
      profile.formatPreference === FormatPreference.REMOTE &&
      initiative.format === FormatType.REMOTE
    ) {
      format = 1;
    } else if (
      profile.formatPreference === FormatPreference.ON_SITE &&
      initiative.format === FormatType.ON_SITE
    ) {
      format = 1;
    }

    const urgency = URGENCY_VALUES[initiative.type] ?? 0;

    let startsSoon: number;
    if (initiative.startsAt == null) {
      startsSoon = 0.4;
    } else {
      const days = daysBetween(new Date(initiative.startsAt), now);
      if (days < 0) startsSoon = 0;
      else if (days <= 14) startsSoon = 1;
      else if (days >= 30) startsSoon = 0;
      else startsSoon = 1 - (days - 14) / (30 - 14);
    }

    const daysSinceCreated = daysBetween(now, new Date(initiative.createdAt));
    let recency: number;
    if (daysSinceCreated <= 7) recency = 1;
    else if (daysSinceCreated >= 30) recency = 0;
    else recency = 1 - (daysSinceCreated - 7) / (30 - 7);

    return { interest, location, format, urgency, startsSoon, recency };
  }

  private buildReasons(
    initiative: InitiativeDto,
    profile: VolunteerProfileDto,
    terms: TermValues,
    now: Date,
  ): string[] {
    const eligible: { key: ReasonKey; raw: number; label: string }[] = [];

    if (terms.interest >= 0.7) {
      eligible.push({
        key: 'interest',
        raw: terms.interest,
        label: `Збігається з інтересом «${initiative.categoryName}»`,
      });
    }
    if (terms.urgency === 1) {
      eligible.push({ key: 'urgency', raw: terms.urgency, label: 'Терміново' });
    }
    if (terms.location === 1) {
      if (initiative.format === FormatType.ON_SITE && initiative.city) {
        eligible.push({
          key: 'location',
          raw: terms.location,
          label: `Поруч (${initiative.city})`,
        });
      } else if (initiative.format === FormatType.REMOTE) {
        eligible.push({
          key: 'location',
          raw: terms.location,
          label: 'Можна дистанційно',
        });
      }
    }
    if (terms.startsSoon >= 0.7 && initiative.startsAt) {
      const days = Math.max(
        0,
        Math.round(daysBetween(new Date(initiative.startsAt), now)),
      );
      eligible.push({
        key: 'startsSoon',
        raw: terms.startsSoon,
        label: `Старт за ${days} днів`,
      });
    }
    const locationCoversFormat =
      terms.location === 1 &&
      ((initiative.format === FormatType.REMOTE &&
        profile.formatPreference !== FormatPreference.ON_SITE) ||
        (initiative.format === FormatType.ON_SITE &&
          profile.formatPreference !== FormatPreference.REMOTE));
    if (terms.format === 1 && !locationCoversFormat) {
      eligible.push({
        key: 'format',
        raw: terms.format,
        label: 'Підходить за форматом',
      });
    }
    if (terms.recency >= 0.7) {
      eligible.push({
        key: 'recency',
        raw: terms.recency,
        label: 'Нова ініціатива',
      });
    }

    eligible.sort((a, b) => {
      if (b.raw !== a.raw) return b.raw - a.raw;
      return REASON_PRIORITY.indexOf(a.key) - REASON_PRIORITY.indexOf(b.key);
    });

    return eligible.slice(0, 3).map((r) => r.label);
  }
}
