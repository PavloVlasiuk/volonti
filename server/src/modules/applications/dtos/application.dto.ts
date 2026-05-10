import { ApplicationStatus } from '../../../common/enums';
import { Application } from '../entities/application.entity';

export class ApplicationDto {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  initiativeId: string;
  initiativeTitle: string;
  volunteerProfileId: string;
  volunteerFirstName: string;
  volunteerLastName: string;

  constructor(entity: Application) {
    this.id = entity.id;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.initiativeId = entity.initiative?.id;
    this.initiativeTitle = entity.initiative?.title;
    this.volunteerProfileId = entity.volunteerProfile?.id;
    this.volunteerFirstName = entity.volunteerProfile?.firstName;
    this.volunteerLastName = entity.volunteerProfile?.lastName;
  }
}
