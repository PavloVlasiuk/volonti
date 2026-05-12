import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv, EnvironmentVariables } from './env.variables';
import { MailModule } from './modules/mail/mail.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { OtpModule } from './modules/otp/otp.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';
import { VolunteerProfilesModule } from './modules/volunteer-profiles/volunteer-profiles.module';
import { InitiativesModule } from './modules/initiatives/initiatives.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        database: config.get('DB_NAME'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    MailModule,
    UploadModule,
    UsersModule,
    OtpModule,
    CategoriesModule,
    OrganizationsModule,
    AuthModule,
    VolunteerProfilesModule,
    InitiativesModule,
    ApplicationsModule,
    AdminModule,
  ],
  providers: [],
})
export class AppModule {}
