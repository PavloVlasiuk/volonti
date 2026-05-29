import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { OtpCode } from '../entities/otp-code.entity';
import { OtpCodeDto } from '../dtos/otp-code.dto';

@Injectable()
export class OtpRepository extends BaseRepositoryWrapper<OtpCode, OtpCodeDto> {
  protected dtoClass = OtpCodeDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(OtpCode, dataSource.createEntityManager());
  }

  async findByPendingToken(pendingToken: string): Promise<OtpCodeDto | null> {
    return this.findOneToDto({ where: { pendingToken } });
  }

  async findLatestByActor(actorId: string): Promise<OtpCodeDto | null> {
    return this.findOneToDto({
      where: { actorId },
      order: { createdAt: 'DESC' },
    });
  }
}
