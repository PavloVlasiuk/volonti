import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  readonly NODE_ENV!: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @Type(() => Number)
  @IsOptional()
  readonly PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  readonly DB_HOST!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  readonly DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  readonly DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  readonly DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  readonly DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  readonly MAIL_HOST!: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  readonly MAIL_PORT!: number;

  @IsString()
  @IsNotEmpty()
  readonly MAIL_USER!: string;

  @IsString()
  @IsNotEmpty()
  readonly MAIL_PASS!: string;

  @IsString()
  @IsNotEmpty()
  readonly MAIL_FROM!: string;

  @IsString()
  @IsNotEmpty()
  readonly UPLOAD_DIR!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  readonly MAX_FILE_SIZE_MB: number = 10;

  @IsString()
  @IsNotEmpty()
  readonly FRONTEND_URL!: string;
}

export const validateEnv = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
};
