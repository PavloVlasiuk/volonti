import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EnvironmentVariables } from '../../env.variables';
import { MailService } from './services/mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        transport: {
          host: config.get('MAIL_HOST', { infer: true }),
          port: config.get('MAIL_PORT', { infer: true }),
          auth: {
            user: config.get('MAIL_USER', { infer: true }),
            pass: config.get('MAIL_PASS', { infer: true }),
          },
        },
        defaults: {
          from: config.get('MAIL_FROM', { infer: true }),
        },
        template: {
          dir: join(process.cwd(), 'mail', 'templates'),
          adapter: new HandlebarsAdapter({
            eq: (a: unknown, b: unknown) => a === b,
          }),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
