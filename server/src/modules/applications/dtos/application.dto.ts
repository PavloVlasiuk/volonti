import { ApplicationStatus } from '../../../common/enums';
import { Application } from '../entities/application.entity';

export class ApplicationDto {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  initiative: {
    id: string;
    title: string;
    organization: {
      id: string;
      name: string;
    };
  };
  volunteer: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(entity: Application) {
    this.id = entity.id;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.initiative = {
      id: entity.initiative?.id,
      title: entity.initiative?.title,
      organization: {
        id: entity.initiative?.organization?.id,
        name: entity.initiative?.organization?.name,
      },
    };
    this.volunteer = {
      id: entity.volunteerProfile?.id,
      firstName: entity.volunteerProfile?.firstName,
      lastName: entity.volunteerProfile?.lastName,
    };
  }
}
