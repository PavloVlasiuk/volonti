import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { InitiativeDismissal } from '../entities/initiative-dismissal.entity';

@Injectable()
export class InitiativeDismissalsRepository extends Repository<InitiativeDismissal> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(InitiativeDismissal, dataSource.createEntityManager());
  }

  async dismiss(userId: string, initiativeId: string): Promise<void> {
    try {
      await this.insert({ userId, initiativeId });
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as QueryFailedError & { code?: string }).code === '23505'
      ) {
        return;
      }
      throw err;
    }
  }

  async getDismissedIds(userId: string): Promise<string[]> {
    const rows = await this.createQueryBuilder('d')
      .select('d.initiative_id', 'initiativeId')
      .where('d.user_id = :userId', { userId })
      .getRawMany<{ initiativeId: string }>();
    return rows.map((r) => r.initiativeId);
  }
}
